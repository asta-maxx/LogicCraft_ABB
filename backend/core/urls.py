# core/urls.py
from django.urls import path
from .views import RAGAPIView, DocumentUploadAPIView

urlpatterns = [
    path("rag/", RAGAPIView.as_view(), name="rag"),
    path("upload/", DocumentUploadAPIView.as_view(), name="upload"),
]
