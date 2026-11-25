from app.extensions import db
from datetime import datetime, timezone
from uuid import uuid4


class DocumentWorkflow(db.Model):
    __tablename__ = "document_workflows"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id"), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="pending")  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime)

    document = db.relationship("Document", back_populates="workflows")
    steps = db.relationship("WorkflowStep", back_populates="workflow")


class WorkflowStep(db.Model):
    __tablename__ = "workflow_steps"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    workflow_id = db.Column(db.String(36), db.ForeignKey("document_workflows.id"), nullable=False)
    step_number = db.Column(db.Integer, nullable=False)
    assignee_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    workflow = db.relationship("DocumentWorkflow", back_populates="steps")
    decisions = db.relationship("ApprovalDecision", back_populates="workflow_step")


class ApprovalDecision(db.Model):
    __tablename__ = "approval_decisions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    workflow_step_id = db.Column(db.String(36), db.ForeignKey("workflow_steps.id"), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    decision = db.Column(db.String(20), nullable=False)  # approved, rejected
    comment = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    workflow_step = db.relationship("WorkflowStep", back_populates="decisions")


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"))
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(100))
    resource_id = db.Column(db.String(36))
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class IntegrationConfiguration(db.Model):
    __tablename__ = "integration_configurations"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    provider = db.Column(db.String(50), nullable=False)  # ldaps, saml, etc.
    config = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
