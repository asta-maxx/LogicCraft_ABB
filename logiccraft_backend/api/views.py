from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Session, ConversationHistory
from .services import get_or_create_session, store_conversation, get_conversation_history, CodeGenerationService, CodeValidationService
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
class SessionMemoryView(APIView):
    """
    POST /api/session-memory/ {"key": "foo", "value": "bar"} to store in session
    GET /api/session-memory/?key=foo to retrieve from session
    """
    @method_decorator(csrf_exempt)
    def post(self, request):
        key = request.data.get('key')
        value = request.data.get('value')
        if not key or value is None:
            return Response({'error': 'key and value required'}, status=status.HTTP_400_BAD_REQUEST)
        request.session[key] = value
        request.session.modified = True
        return Response({'message': f'Stored {key} in session.'})

    @method_decorator(csrf_exempt)
    def get(self, request):
        key = request.query_params.get('key')
        if not key:
            return Response({'error': 'key query param required'}, status=status.HTTP_400_BAD_REQUEST)
        value = request.session.get(key)
        if value is None:
            return Response({'error': f'No value found for key {key}.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'key': key, 'value': value})

class UserHistoryView(APIView):
    """
    GET /api/history/
    Returns recent generations for the authenticated user only.
    """
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Only fetch sessions for the current user
        sessions = Session.objects.filter(user=request.user)
        if not sessions.exists():
            return Response({'history': []})

        # Only fetch conversation history for sessions belonging to the current user
        history = ConversationHistory.objects.filter(session__in=sessions).order_by('-timestamp')[:20]
        data = [
            {
                'session_id': h.session.session_id,
                'user_prompt': h.user_prompt,
                'generated_code': h.generated_code,
                'timestamp': h.timestamp,
            }
            for h in history
        ]
        return Response({'history': data})
class LLMConversationView(APIView):
    def post(self, request):
        session_id = request.data.get('session_id')
        user_prompt = request.data.get('prompt')
        if not user_prompt:
            return Response({'error': 'Missing prompt.'}, status=status.HTTP_400_BAD_REQUEST)
        # Only create session and store history for authenticated users
        if request.user.is_authenticated:
            user = request.user
            session = get_or_create_session(session_id, user=user)
            history = get_conversation_history(session)
            # Construct LLM prompt from history + user_prompt
            prompt = '\n'.join([h.user_prompt + '\n' + h.generated_code for h in history]) + '\n' + user_prompt
            generated_code = f"[LLM output for]: {prompt}"  # Placeholder
            store_conversation(session, user_prompt, generated_code)
            return Response({'session_id': session.session_id, 'generated_code': generated_code})
        else:
            # For anonymous users, do not store or create session
            generated_code = f"[LLM output for]: {user_prompt}"
            return Response({'session_id': None, 'generated_code': generated_code})


class GenerateCodeView(APIView):
    def post(self, request):
        input_text = request.data.get('input')
        if not input_text:
            return Response({'error': 'Missing input.'}, status=status.HTTP_400_BAD_REQUEST)
        result = CodeGenerationService.generate(input_text)
        return Response(result, status=status.HTTP_200_OK)

class ValidateCodeView(APIView):
    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Missing code.'}, status=status.HTTP_400_BAD_REQUEST)
        result = CodeValidationService.validate(code)
        return Response(result, status=status.HTTP_200_OK)


class IndexDocumentView(APIView):
    """
    POST JSON:
    {
      "id": "optional-document-id",
      "collection": "default",
      "text": "long text here",
      "metadata": {"title": "...", "source": "..."}
    }
    """
    def post(self, request):
        data = request.data
        doc_id = data.get("id") or str(uuid.uuid4())
        collection = data.get("collection", "default")
        text = data.get("text", "")
        metadata = data.get("metadata", {})

        if not text:
            return Response({"detail": "text is required"}, status=status.HTTP_400_BAD_REQUEST)

        chunks = chunk_text(text)
        ids = [f"{doc_id}__{i}" for i in range(len(chunks))]
        metadatas = [{**metadata, "chunk_index": i} for i in range(len(chunks))]
        # compute embeddings (synchronous)
        embeddings = [get_embedding(c) for c in chunks]

        # store in chroma
        upsert_chunks(collection, ids=ids, documents=chunks, metadatas=metadatas, embeddings=embeddings)
        return Response({"indexed_chunks": len(chunks), "id": doc_id})

class SearchView(APIView):
    """
    GET /api/search/?q=your query&collection=default&k=5
    """
    def get(self, request):
        q = request.query_params.get("q", "")
        if not q:
            return Response({"detail": "q query param required"}, status=status.HTTP_400_BAD_REQUEST)
        collection = request.query_params.get("collection", "default")
        k = int(request.query_params.get("k", getattr(settings, "CHROMA_DEFAULT_K", 5)))
        q_emb = get_embedding(q)
        res = query(collection, q_emb, n_results=k)

        # format result; chroma query returns nested lists for each field
        documents = res.get("documents", [[]])[0]
        metadatas = res.get("metadatas", [[]])[0]
        distances = res.get("distances", [[]])[0]
        ids = res.get("ids", [[]])[0]

        hits = []
        for i, doc in enumerate(documents):
            hits.append({
                "id": ids[i] if i < len(ids) else None,
                "document": doc,
                "metadata": metadatas[i] if i < len(metadatas) else None,
                "distance": distances[i] if i < len(distances) else None
            })

        return Response({"query": q, "results": hits})