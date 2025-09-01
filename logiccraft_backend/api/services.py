import uuid
from .models import Session, ConversationHistory
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
    return ConversationHistory.objects.filter(session=session).order_by('-timestamp')[:n_turns][::-1]
from .utils.cache import CacheManager
from .utils.llm_client import LLMClient
from .utils.validator import Validator
import hashlib
from django.conf import settings

class CodeGenerationService:
    @staticmethod
    def generate(input_text):
        cache = CacheManager(settings.REDIS_URL)
        key = hashlib.md5(input_text.encode()).hexdigest()
        cached_code = cache.get(key)
        if cached_code:
            return {'code': cached_code, 'source': 'cache'}
        llm = LLMClient(settings.VLLM_SERVER_URL)
        code = llm.generate_code(input_text)
        cache.set(key, code, ttl=86400)
        return {'code': code, 'source': 'llm'}

class CodeValidationService:
    @staticmethod
    def validate(code):
        validator = Validator()
        return validator.validate(code)
