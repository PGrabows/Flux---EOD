import os
from datetime import datetime, timezone

from google import genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.extensions import db
from app.models.document import Document, OcrJob


class OcrService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = genai.Client(api_key=api_key)
        self.model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((ConnectionError, TimeoutError)),
    )
    def _call_gemini(self, file_path: str) -> str:
        """Extract text from document using Gemini API."""
        with open(file_path, "rb") as f:
            file_data = f.read()

        response = self.client.models.generate_content(
            model=self.model,
            contents=[
                "Wyextraktuj z tego dokumentu następujące dane: numer dokumentu, data, sprzedawca, kwota. Zwróć wynik w formacie JSON.",
                genai.upload_file(file_data, mime_type="application/pdf"),
            ],
        )
        return response.text

    def start_ocr(self, doc_id: str) -> dict | None:
        doc = Document.query.get(doc_id)
        if not doc:
            return None

        job = OcrJob(document_id=doc_id, status="processing")
        db.session.add(job)
        db.session.commit()

        try:
            extracted_text = self._call_gemini(doc.storage_path)
            job.status = "completed"
            job.extracted_text = extracted_text
            job.completed_at = datetime.now(timezone.utc)
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)

        db.session.commit()
        return self._serialize_job(job)

    def get_ocr_status(self, doc_id: str) -> dict | None:
        job = OcrJob.query.filter_by(document_id=doc_id).order_by(OcrJob.created_at.desc()).first()
        if not job:
            return None
        return self._serialize_job(job)

    def get_ocr_result(self, doc_id: str) -> dict | None:
        job = OcrJob.query.filter_by(document_id=doc_id, status="completed").order_by(OcrJob.created_at.desc()).first()
        if not job:
            return None
        return self._serialize_job(job)

    def _serialize_job(self, job: OcrJob) -> dict:
        return {
            "id": job.id,
            "document_id": job.document_id,
            "status": job.status,
            "extracted_text": job.extracted_text,
            "error_message": job.error_message,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        }
