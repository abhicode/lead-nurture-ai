import uuid
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from chromadb.utils import embedding_functions

from .chroma_client import get_chroma_collection

# Initialize embedding model once
embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100):
    """Recursive text splitter for managing large documents"""
    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def embed_and_store_pdf(file_path: str, metadata: dict = None):
    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)
    embeddings = embedding_model.encode(chunks).tolist()

    collection = get_chroma_collection()

    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [{"source_file": file_path, **(metadata or {})} for _ in chunks]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    return {"chunks_ingested": len(chunks), "collection": collection.name}
