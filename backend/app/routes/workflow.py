from flask import Blueprint, request, jsonify
from app.services.workflow_service import WorkflowService

workflow_bp = Blueprint("workflow", __name__)
workflow_service = WorkflowService()


@workflow_bp.route("/pending", methods=["GET"])
def pending_approvals():
    approvals = workflow_service.get_pending_approvals()
    return jsonify(approvals)


@workflow_bp.route("/<step_id>/approve", methods=["POST"])
def approve(step_id):
    data = request.get_json()
    success = workflow_service.approve_step(step_id, data.get("comment"))
    if not success:
        return jsonify({"error": "Failed to approve"}), 400
    return jsonify({"message": "Approved"}), 200


@workflow_bp.route("/<step_id>/reject", methods=["POST"])
def reject(step_id):
    data = request.get_json()
    success = workflow_service.reject_step(step_id, data.get("comment"))
    if not success:
        return jsonify({"error": "Failed to reject"}), 400
    return jsonify({"message": "Rejected"}), 200


@workflow_bp.route("/document/<doc_id>", methods=["GET"])
def document_history(doc_id):
    history = workflow_service.get_document_history(doc_id)
    return jsonify(history)
