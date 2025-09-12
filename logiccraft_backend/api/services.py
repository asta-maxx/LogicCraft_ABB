# api/services.py (or wherever your current services.py is)
import uuid
import hashlib
from django.conf import settings
from .models import Session, ConversationHistory
from .utils.cache import CacheManager
from .utils.llm_client import LLMClient
from .utils.validator import Validator

def get_or_create_session(session_id=None):
    if session_id:
        session, _ = Session.objects.get_or_create(session_id=session_id)
    else:
        session_id = str(uuid.uuid4())
        session = Session.objects.create(session_id=session_id)
    return session

def store_conversation(session, user_prompt, generated_code):
    ConversationHistory.objects.create(
        session=session,
        user_prompt=user_prompt,
        generated_code=generated_code
    )

def get_conversation_history(session, n_turns=10):
    return (
        ConversationHistory.objects.filter(session=session)
        .order_by("-timestamp")[:n_turns][::-1]
    )

class CodeGenerationService:
    @staticmethod
    def generate(input_text: str):
        cache = CacheManager(getattr(settings, "REDIS_URL", None))
        key = hashlib.md5(input_text.encode()).hexdigest()
        try:
            cached_code = cache.get(key) if cache else None
        except Exception:
            cached_code = None

        if cached_code:
            return {"code": cached_code, "source": "cache"}

        base = getattr(settings, "VLLM_SERVER_URL", "http://localhost:8001")
        llm = LLMClient(base)
        try:
            code = llm.generate_code(prompt=input_text, max_tokens=200, temperature=0.1)
        except Exception as e:
            # return an error dict instead of raising so views can decide response
            return {"error": str(e)}

        try:
            if cache:
                cache.set(key, code, ttl=86400)
        except Exception:
            pass

        return {"code": code, "source": "llm"}

class CodeValidationService:
    @staticmethod
    def validate(code: str):
        validator = Validator()
        return validator.validate(code)
