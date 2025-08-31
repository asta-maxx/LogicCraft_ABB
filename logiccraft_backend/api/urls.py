from django.urls import path
from .views import GenerateCodeView, ValidateCodeView

urlpatterns = [
    path('generate/', GenerateCodeView.as_view(), name='generate-code'),
    path('validate/', ValidateCodeView.as_view(), name='validate-code'),
]
