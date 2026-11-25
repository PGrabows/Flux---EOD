from flask import Blueprint, request, jsonify
from app.services.document_service import DocumentService

documents_bp = Blueprint("documents", __name__)
document_service = DocumentService()


@documents_bp.route("/", methods=["GET"])
def list_documents():
    documents = document_service.list_documents()
    return jsonify(documents)


@documents_bp.route("/<doc_id>", methods=["GET"])
def get_document(doc_id):
    document = document_service.get_document(doc_id)
    if not document:
        return jsonify({"error": "Not found"}), 404
    return jsonify(document)


@documents_bp.route("/", methods=["POST"])
def upload_document():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    document = document_service.upload_document(file)
    return jsonify(document), 201


@documents_bp.route("/<doc_id>", methods=["PUT"])
def update_document(doc_id):
    data = request.get_json()
    document = document_service.update_document(doc_id, data)
    if not document:
        return jsonify({"error": "Not found"}), 404
    return jsonify(document)


@documents_bp.route("/<doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    success = document_service.delete_document(doc_id)
    if not success:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"message": "Deleted"}), 200
