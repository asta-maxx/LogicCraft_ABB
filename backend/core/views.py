from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .rag_service import rag_generate, add_document

class RAGAPIView(APIView):
    def post(self, request):
        query = request.data.get("query")
        if not query:
            return Response({"error": "query required"}, status=status.HTTP_400_BAD_REQUEST)

        answer = rag_generate(query)
        return Response({"answer": answer})

class DocumentUploadAPIView(APIView):
    def post(self, request):
        text = request.data.get("text")
        if not text:
            return Response({"error": "text required"}, status=status.HTTP_400_BAD_REQUEST)

        add_document(text)
        return Response({"message": "Document added to knowledge base"})
