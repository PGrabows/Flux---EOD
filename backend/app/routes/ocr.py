from flask import Blueprint, request, jsonify
from app.services.ocr_service import OcrService

ocr_bp = Blueprint("ocr", __name__)
ocr_service = OcrService()


@ocr_bp.route("/<doc_id>", methods=["POST"])
def start_ocr(doc_id):
    job = ocr_service.start_ocr(doc_id)
    if not job:
        return jsonify({"error": "Document not found"}), 404
    return jsonify(job), 202


@ocr_bp.route("/<doc_id>/status", methods=["GET"])
def ocr_status(doc_id):
    job = ocr_service.get_ocr_status(doc_id)
    if not job:
        return jsonify({"error": "Not found"}), 404
    return jsonify(job)


@ocr_bp.route("/<doc_id>/result", methods=["GET"])
def ocr_result(doc_id):
    result = ocr_service.get_ocr_result(doc_id)
    if not result:
        return jsonify({"error": "Not found"}), 404
    return jsonify(result)
