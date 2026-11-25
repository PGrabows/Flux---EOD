from app.extensions import db
from datetime import datetime, timezone
from uuid import uuid4


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    storage_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    uploaded_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    status_id = db.Column(db.String(36), db.ForeignKey("document_statuses.id"))
    type_id = db.Column(db.String(36), db.ForeignKey("document_types.id"))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # OCR extracted fields
    document_number = db.Column(db.String(100))
    document_date = db.Column(db.Date)
    seller = db.Column(db.String(255))
    amount = db.Column(db.Float)

    versions = db.relationship("DocumentVersion", back_populates="document")
    ocr_jobs = db.relationship("OcrJob", back_populates="document")
    workflows = db.relationship("DocumentWorkflow", back_populates="document")


class DocumentVersion(db.Model):
    __tablename__ = "document_versions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id"), nullable=False)
    version_number = db.Column(db.Integer, nullable=False)
    storage_path = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    document = db.relationship("Document", back_populates="versions")


class DocumentStatus(db.Model):
    __tablename__ = "document_statuses"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255))


class DocumentType(db.Model):
    __tablename__ = "document_types"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255))


class OcrJob(db.Model):
    __tablename__ = "ocr_jobs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")  # pending, processing, completed, failed
    extracted_text = db.Column(db.Text)
    error_message = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime)

    document = db.relationship("Document", back_populates="ocr_jobs")
