from app.extensions import db
from app.models.workflow import DocumentWorkflow, WorkflowStep, ApprovalDecision


class WorkflowService:
    def get_pending_approvals(self) -> list:
        steps = WorkflowStep.query.filter_by(status="pending").all()
        return [self._serialize_step(step) for step in steps]

    def approve_step(self, step_id: str, comment: str = None) -> bool:
        step = WorkflowStep.query.get(step_id)
        if not step:
            return False

        decision = ApprovalDecision(
            workflow_step_id=step_id,
            user_id="",  # TODO: get from session
            decision="approved",
            comment=comment,
        )
        step.status = "approved"
        db.session.add(decision)
        db.session.commit()
        return True

    def reject_step(self, step_id: str, comment: str = None) -> bool:
        step = WorkflowStep.query.get(step_id)
        if not step:
            return False

        decision = ApprovalDecision(
            workflow_step_id=step_id,
            user_id="",  # TODO: get from session
            decision="rejected",
            comment=comment,
        )
        step.status = "rejected"
        db.session.add(decision)
        db.session.commit()
        return True

    def get_document_history(self, doc_id: str) -> list:
        workflow = DocumentWorkflow.query.filter_by(document_id=doc_id).first()
        if not workflow:
            return []
        decisions = ApprovalDecision.query.join(
            WorkflowStep, ApprovalDecision.workflow_step_id == WorkflowStep.id
        ).filter(WorkflowStep.workflow_id == workflow.id).all()
        return [self._serialize_decision(d) for d in decisions]

    def _serialize_step(self, step: WorkflowStep) -> dict:
        return {
            "id": step.id,
            "workflow_id": step.workflow_id,
            "step_number": step.step_number,
            "assignee_id": step.assignee_id,
            "status": step.status,
            "created_at": step.created_at.isoformat() if step.created_at else None,
        }

    def _serialize_decision(self, decision: ApprovalDecision) -> dict:
        return {
            "id": decision.id,
            "workflow_step_id": decision.workflow_step_id,
            "user_id": decision.user_id,
            "decision": decision.decision,
            "comment": decision.comment,
            "created_at": decision.created_at.isoformat() if decision.created_at else None,
        }
