import os
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models.document import Document, DocumentVersion, DocumentStatus, DocumentType
from app.utils.file_handling import allowed_file


class DocumentService:
    ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}

    def list_documents(self) -> list:
        documents = Document.query.all()
        return [self._serialize(doc) for doc in documents]

    def get_document(self, doc_id: str) -> dict | None:
        doc = Document.query.get(doc_id)
        if not doc:
            return None
        return self._serialize(doc)

    def upload_document(self, file, user_id: str = None) -> dict | None:
        if not file or not allowed_file(file.filename, self.ALLOWED_EXTENSIONS):
            return None

        filename = secure_filename(file.filename)
        storage_path = os.path.join(
            os.getenv("UPLOAD_FOLDER", "/app/storage/uploads"), filename
        )
        os.makedirs(os.path.dirname(storage_path), exist_ok=True)
        file.save(storage_path)

        doc = Document(
            filename=filename,
            storage_path=storage_path,
            file_size=os.path.getsize(storage_path),
            uploaded_by=user_id or "",
        )
        db.session.add(doc)
        db.session.commit()
        return self._serialize(doc)

    def update_document(self, doc_id: str, data: dict) -> dict | None:
        doc = Document.query.get(doc_id)
        if not doc:
            return None
        for key, value in data.items():
            if hasattr(doc, key):
                setattr(doc, key, value)
        db.session.commit()
        return self._serialize(doc)

    def delete_document(self, doc_id: str) -> bool:
        doc = Document.query.get(doc_id)
        if not doc:
            return False
        db.session.delete(doc)
        db.session.commit()
        return True

    def _serialize(self, doc: Document) -> dict:
        return {
            "id": doc.id,
            "filename": doc.filename,
            "file_size": doc.file_size,
            "mime_type": doc.mime_type,
            "uploaded_by": doc.uploaded_by,
            "document_number": doc.document_number,
            "document_date": doc.document_date.isoformat() if doc.document_date else None,
            "seller": doc.seller,
            "amount": doc.amount,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
        }
