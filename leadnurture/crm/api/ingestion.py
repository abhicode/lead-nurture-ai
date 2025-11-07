from ninja import Router, File
from ninja.files import UploadedFile
import os
from tempfile import NamedTemporaryFile

from ..agents.ingestion import embed_and_store_pdf
from crm.auth import JWTAuth

auth = JWTAuth()

router = Router(tags=["Ingestion"])

@router.post("/ingest/")
def ingest_pdf(request, file: UploadedFile = File(...)):
    """Upload and ingest a PDF brochure"""
    with NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        for chunk in file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    result = embed_and_store_pdf(tmp_path, metadata={"filename": file.name})

    os.remove(tmp_path)
    return {"message": "PDF ingested successfully", "details": result}
