# api/utils/chunking.py
import re
from typing import List

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Naive chunker: break on paragraphs or whitespace to get chunks of ~chunk_size chars.
    """
    text = text.strip()
    if not text:
        return []

    # try splitting by paragraphs first
    paras = [p.strip() for p in re.split(r'\n{2,}', text) if p.strip()]

    chunks = []
    for p in paras:
        if len(p) <= chunk_size:
            chunks.append(p)
            continue

        # split large paragraph into smaller chunks with overlap
        i = 0
        while i < len(p):
            chunk = p[i:i+chunk_size]
            chunks.append(chunk)
            i += chunk_size - overlap
    # if no paragraphs, fallback split
    if not chunks:
        i = 0
        while i < len(text):
            chunks.append(text[i:i+chunk_size])
            i += chunk_size - overlap
    return chunks