from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .rag_service import rag_generate
from .validate_code import validate_code

class RAGAPIView(APIView):
    def post(self, request):
        query = request.data.get("query")
        if not query:
            return Response({"error": "query required"}, status=status.HTTP_400_BAD_REQUEST)

        answer = rag_generate(query)
        return Response({"answer": answer})

class ValidateAPIView(APIView):
    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"error": "code required"}, status=status.HTTP_400_BAD_REQUEST)

        result = validate_code(code)
        return Response(result)