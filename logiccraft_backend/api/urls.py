from django.urls import path
from .views import GenerateCodeView, ValidateCodeView,IndexDocumentView, SearchView

urlpatterns = [
    path('generate/', GenerateCodeView.as_view(), name='generate-code'),
    path('validate/', ValidateCodeView.as_view(), name='validate-code'),
    path("index/", IndexDocumentView.as_view(), name="index-document"),
    path("search/", SearchView.as_view(), name="search"),
]
