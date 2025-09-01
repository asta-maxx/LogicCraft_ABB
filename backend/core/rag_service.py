import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline

# Embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# LLM model (TinyLlama)
generator = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    device_map="auto"
)

# Initialize FAISS index
dimension = embedder.get_sentence_embedding_dimension()
index = faiss.IndexFlatL2(dimension)
documents = []  # store raw text alongside embeddings


def add_document(text: str):
    embedding = embedder.encode([text])
    index.add(np.array(embedding, dtype="float32"))
    documents.append(text)


def retrieve(query: str, top_k=2):
    if len(documents) == 0:
        return []  # nothing to retrieve

    embedding = embedder.encode([query])
    D, I = index.search(np.array(embedding, dtype="float32"), min(top_k, len(documents)))
    return [documents[i] for i in I[0] if i < len(documents)]



def rag_generate(query: str, max_new_tokens=100):
    retrieved_docs = retrieve(query)
    
    if not retrieved_docs:
        # If no docs uploaded yet, just pass query to the model
        augmented_prompt = f"User Question: {query}\nAnswer:"
    else:
        context = "\n".join(retrieved_docs)
        augmented_prompt = f"Context:\n{context}\n\nUser Question: {query}\nAnswer:"
    
    response = generator(
        augmented_prompt,
        max_new_tokens=max_new_tokens,
        temperature=0.7,
        top_p=0.9
    )
    return response[0]["generated_text"]

