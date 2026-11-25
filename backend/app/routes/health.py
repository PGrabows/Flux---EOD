from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("", methods=["GET"])
def health():
    """Lekki endpoint do sprawdzania dostępności API (frontend, nginx, monitoring)."""
    return jsonify({"status": "ok"})
