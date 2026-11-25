from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    token = auth_service.login(data.get("username"), data.get("password"))
    if not token:
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify({"token": token})


@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out"}), 200
