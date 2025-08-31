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
