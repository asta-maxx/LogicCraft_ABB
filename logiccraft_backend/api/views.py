from .services import get_or_create_session, store_conversation, get_conversation_history
class LLMConversationView(APIView):
    def post(self, request):
        session_id = request.data.get('session_id')
        user_prompt = request.data.get('prompt')
        if not user_prompt:
            return Response({'error': 'Missing prompt.'}, status=status.HTTP_400_BAD_REQUEST)
        session = get_or_create_session(session_id)
        history = get_conversation_history(session)
        # Construct LLM prompt from history + user_prompt
        # For demonstration, concatenate prompts
        prompt = '\n'.join([h.user_prompt + '\n' + h.generated_code for h in history]) + '\n' + user_prompt
        # generated_code = call_llm(prompt)  # Replace with actual LLM call
        generated_code = f"[LLM output for]: {prompt}"  # Placeholder
        store_conversation(session, user_prompt, generated_code)
        return Response({'session_id': session.session_id, 'generated_code': generated_code})
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import CodeGenerationService, CodeValidationService

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
