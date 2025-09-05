# core/urls.py
from django.urls import path
from .views import RAGAPIView, ValidateAPIView

urlpatterns = [
    path("rag/", RAGAPIView.as_view(), name="rag"),
    path("validate/", ValidateAPIView.as_view(), name="validate"),
    
]
