import uuid
import hashlib
from django.conf import settings
from .models import Session, ConversationHistory
from .utils.cache import CacheManager
from .utils.llm_client import LLMClient
from .utils.validator import Validator
# from .utils.chroma_client import get_chroma_client  # Uncomment if using ChromaDB

def get_or_create_session(session_id=None, user=None):
    if session_id:
        session, _ = Session.objects.get_or_create(session_id=session_id, defaults={'user': user})
        if session.user is None and user is not None:
            session.user = user
            session.save()
    else:
        session_id = str(uuid.uuid4())
        session = Session.objects.create(session_id=session_id, user=user)
    return session

def store_conversation(session, user_prompt, generated_code):
    # Only store if session is linked to an authenticated user
    if session.user is not None:
        ConversationHistory.objects.create(
            session=session,
            user_prompt=user_prompt,
            generated_code=generated_code
        )
    # Example: Store to ChromaDB for semantic search (optional)
    # chroma = get_chroma_client()
    # chroma.upsert(...)

def get_conversation_history(session, n_turns=10):
    return (
        ConversationHistory.objects.filter(session=session)
        .order_by("-timestamp")[:n_turns][::-1]
    )

class CodeGenerationService:
    @staticmethod
    def generate(input_text: str, max_attempts: int = 5):
        cache = CacheManager(getattr(settings, "REDIS_URL", None))
        key = hashlib.md5(input_text.encode()).hexdigest()
        try:
            cached_code = cache.get(key) if cache else None
        except Exception:
            cached_code = None

        if cached_code:
            # Optionally, validate cached code before returning
            validation = CodeValidationService.validate(cached_code)
            if validation.get('valid'):
                return {"code": cached_code, "source": "cache", "validation": validation}

        base = getattr(settings, "VLLM_SERVER_URL", "http://localhost:8001")
        llm = LLMClient(base)
        last_error = None
        prompt = input_text
        for attempt in range(1, max_attempts + 1):
            try:
                code = llm.generate_code(prompt=prompt, max_tokens=200, temperature=0.1)
            except Exception as e:
                return {"error": str(e), "attempt": attempt}

            validation = CodeValidationService.validate(code)
            if validation.get('valid'):
                try:
                    if cache:
                        cache.set(key, code, ttl=86400)
                except Exception:
                    pass
                return {"code": code, "source": "llm", "validation": validation, "attempts": attempt}
            else:
                last_error = validation.get('errors')
                # Refine prompt with error feedback
                prompt = f"{input_text}\nThe previous code had the following errors during IEC validation: {last_error}\nPlease fix the code and try again."

        return {
            "error": "Failed to generate valid code after multiple attempts.",
            "last_code": code,
            "last_error": last_error,
            "attempts": max_attempts
        }

class CodeValidationService:
    @staticmethod
    def validate(code: str):
        validator = Validator()
        return validator.validate(code)
