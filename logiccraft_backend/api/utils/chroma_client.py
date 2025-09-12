# api/utils/chroma_client.py
import os
from typing import Any, Dict, List
from django.conf import settings

# Delay import of chromadb until runtime so Django can import settings safely.
def _create_client():
    import chromadb
    # New Chroma API: PersistentClient stores DB on-disk.
    # See: chromadb.PersistentClient(path="...") in docs
    persist_dir = getattr(settings, "CHROMA_PERSIST_DIR", None)
    if persist_dir is None:
        # default relative to project base dir
        base_dir = getattr(settings, "BASE_DIR", os.getcwd())
        persist_dir = os.path.join(base_dir, "chroma_db")

    os.makedirs(persist_dir, exist_ok=True)

    # create persistent client (this is the new API)
    client = chromadb.PersistentClient(path=persist_dir)
    return client

# lazy singleton
_chroma_client = None
def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = _create_client()
    return _chroma_client

# Helpers
def get_or_create_collection(name: str = "default"):
    client = get_chroma_client()
    # get_or_create_collection(name=...) returns a Collection object
    return client.get_or_create_collection(name=name)

def upsert_chunks(collection_name: str, ids: List[str], documents: List[str], metadatas: List[Dict[str, Any]], embeddings: List[List[float]]):
    coll = get_or_create_collection(collection_name)
    coll.add(ids=ids, documents=documents, metadatas=metadatas, embeddings=embeddings)
    # PersistentClient persists automatically; explicit persist via client if needed:
    try:
        get_chroma_client().persist()
    except Exception:
        # not all client types implement persist(); ignore if so
        pass

def query(collection_name: str, query_embedding: List[float], n_results: int = 5):
    coll = get_or_create_collection(collection_name)
    # query_embeddings must be a list-of-list
    result = coll.query(query_embeddings=[query_embedding], n_results=n_results, include=["documents", "metadatas", "distances", "ids"])
    return result
