from django.contrib import admin
from .models import Session, ConversationHistory

admin.site.register(Session)
admin.site.register(ConversationHistory)
