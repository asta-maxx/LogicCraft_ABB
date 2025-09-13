from django.urls import path
from .views import GenerateCodeView, ValidateCodeView, UserHistoryView, SessionMemoryView

urlpatterns = [
    path('generate/', GenerateCodeView.as_view(), name='generate-code'),
    path('validate/', ValidateCodeView.as_view(), name='validate-code'),
    path('history/', UserHistoryView.as_view(), name='user-history'),
    path('session-memory/', SessionMemoryView.as_view(), name='session-memory'),
]
