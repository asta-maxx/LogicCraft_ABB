from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Session(models.Model):
	session_id = models.CharField(max_length=64, unique=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='sessions')
	created_at = models.DateTimeField(auto_now_add=True)

class ConversationHistory(models.Model):
	session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='conversations')
	user_prompt = models.TextField()
	generated_code = models.TextField()
	timestamp = models.DateTimeField(auto_now_add=True)
