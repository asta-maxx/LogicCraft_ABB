# core/rag_service.py

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM
)
import torch

# -------------------------------------------------------------------
# 🔹 Use Microsoft Phi-2
# -------------------------------------------------------------------
MODEL_ID = "microsoft/phi-2"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    device_map="auto",   # Auto place layers on GPU/CPU
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)

# -------------------------------------------------------------------
# 🔹 Dummy retriever – replace with FAISS / Chroma / ElasticSearch etc.
# -------------------------------------------------------------------
def retrieve(query: str):
    # Mock docs (replace with real RAG retrieval)
    docs = [
        "Python uses indentation instead of braces.",
        "The 'def' keyword defines a function."
    ]
    return docs


# -------------------------------------------------------------------
# 🔹 Generate using Phi-2
# -------------------------------------------------------------------
def generate_with_model(prompt: str, max_new_tokens=150):
    # Phi-2 is not chat-tuned, so use plain text input
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )

    response = tokenizer.decode(
        outputs[0][inputs["input_ids"].shape[-1]:],
        skip_special_tokens=True
    )
    return response.strip()


# -------------------------------------------------------------------
# 🔹 RAG pipeline entry point
# -------------------------------------------------------------------
def rag_generate(query: str, max_new_tokens=150):
    retrieved_docs = retrieve(query)

    if retrieved_docs:
        context = "\n".join(retrieved_docs)
        augmented_prompt = f"Context:\n{context}\n\nUser Question: {query}\nAnswer:"
    else:
        augmented_prompt = query

    return generate_with_model(augmented_prompt, max_new_tokens=max_new_tokens)
