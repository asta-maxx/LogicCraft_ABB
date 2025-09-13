# api/utils/embeddings.py
import requests
from typing import List
from functools import lru_cache

LOCAL_EMBED_URL = "http://127.0.0.1:8001/embed"  # change if different

@lru_cache(maxsize=1)
def _load_sbert():
    # lazy load fallback model
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str) -> List[float]:
    """
    Return a single embedding vector for the input text.
    Tries local LLM embedding endpoint first, falls back to sentence-transformers.
    """
    # try local LLM embedding endpoint
    try:
        resp = requests.post(LOCAL_EMBED_URL, json={"input": text}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        # expected shape: {"embedding": [..]} or {"embeddings": [[..]]}
        if "embedding" in data:
            return data["embedding"]
        if "embeddings" in data and isinstance(data["embeddings"], list):
            return data["embeddings"][0]
    except Exception as e:
        # fallback to sentence-transformers
        pass

    # fallback
    model = _load_sbert()
    vec = model.encode(text)
    return vec.tolist()