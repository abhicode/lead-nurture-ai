import chromadb
import os
from chromadb.config import Settings

# Move chroma_data to project root level
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
CHROMA_DIR = os.path.join(PROJECT_ROOT, "chroma_data")

def get_chroma_collection(collection_name: str = "brochures"):
    os.makedirs(CHROMA_DIR, exist_ok=True)
    client = chromadb.PersistentClient(path=CHROMA_DIR, settings=Settings(
        allow_reset=True,  # allows resetting the database if needed
        persist_directory=CHROMA_DIR  # ensures persistence across restarts
    ))
    print("Chroma persistence folder:", CHROMA_DIR)
    return client.get_or_create_collection(name=collection_name)
