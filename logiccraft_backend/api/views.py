# api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import (
    get_or_create_session,
    store_conversation,
    get_conversation_history,
    CodeGenerationService,
    CodeValidationService,
)
import uuid
from django.conf import settings

from .utils.chunking import chunk_text
from .utils.embeddings import get_embedding
from .utils.chroma_client import upsert_chunks, query

class LLMConversationView(APIView):
    def post(self, request):
        session_id = request.data.get("session_id")
        user_prompt = request.data.get("prompt")
        if not user_prompt:
            return Response({"error": "Missing prompt."}, status=status.HTTP_400_BAD_REQUEST)

        session = get_or_create_session(session_id)
        history = get_conversation_history(session)
        prompt = "\n".join([h.user_prompt + "\n" + h.generated_code for h in history]) + "\n" + user_prompt

        result = CodeGenerationService.generate(prompt)
        if "error" in result:
            return Response({"error": result["error"]}, status=status.HTTP_502_BAD_GATEWAY)

        generated_code = result.get("code", "")
        store_conversation(session, user_prompt, generated_code)
        return Response({"session_id": session.session_id, "generated_code": generated_code, "source": result.get("source")}, status=status.HTTP_200_OK)

class GenerateCodeView(APIView):
    def post(self, request):
        input_text = request.data.get("input")
        if not input_text:
            return Response({"error": "Missing input."}, status=status.HTTP_400_BAD_REQUEST)

        result = CodeGenerationService.generate(input_text)
        if "error" in result:
            return Response({"error": result["error"]}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(result, status=status.HTTP_200_OK)

class ValidateCodeView(APIView):
    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"error": "Missing code."}, status=status.HTTP_400_BAD_REQUEST)

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
