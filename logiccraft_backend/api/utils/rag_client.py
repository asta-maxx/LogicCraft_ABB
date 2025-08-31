import chromadb
from sentence_transformers import SentenceTransformer
import os

class RAGService:
    def __init__(self):
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        chromadb_url = os.getenv('CHROMADB_SERVER_URL', 'http://localhost:8000')
        self.client = chromadb.HttpClient(host=chromadb_url.split('//')[-1].split(':')[0], port=int(chromadb_url.split(':')[-1]))
        self.collection = self.client.get_or_create_collection("plc_code_examples")

    def get_relevant_examples(self, query_text: str, n_results: int = 3) -> list:
        query_embedding = self.embedding_model.encode(query_text).tolist()
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results['documents'][0] if results.get('documents') else []

rag_service = RAGService()
