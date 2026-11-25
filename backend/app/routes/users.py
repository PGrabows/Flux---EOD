from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService

users_bp = Blueprint("users", __name__)
auth_service = AuthService()


@users_bp.route("/", methods=["GET"])
def list_users():
    users = auth_service.list_users()
    return jsonify(users)


@users_bp.route("/<user_id>", methods=["GET"])
def get_user(user_id):
    user = auth_service.get_user(user_id)
    if not user:
        return jsonify({"error": "Not found"}), 404
    return jsonify(user)


@users_bp.route("/", methods=["POST"])
def create_user():
    data = request.get_json()
    user = auth_service.create_user(data)
    return jsonify(user), 201


@users_bp.route("/<user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    user = auth_service.update_user(user_id, data)
    if not user:
        return jsonify({"error": "Not found"}), 404
    return jsonify(user)


@users_bp.route("/<user_id>/roles", methods=["POST"])
def assign_role(user_id):
    data = request.get_json()
    success = auth_service.assign_role(user_id, data.get("role_id"))
    if not success:
        return jsonify({"error": "Failed to assign role"}), 400
    return jsonify({"message": "Role assigned"}), 200
