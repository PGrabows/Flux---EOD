from app.extensions import db
from datetime import datetime, timezone
from uuid import uuid4


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    roles = db.relationship("UserRole", back_populates="user")


class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    users = db.relationship("UserRole", back_populates="role")
    permissions = db.relationship("RolePermission", back_populates="role")


class Permission(db.Model):
    __tablename__ = "permissions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255))


class UserRole(db.Model):
    __tablename__ = "user_roles"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    role_id = db.Column(db.String(36), db.ForeignKey("roles.id"), nullable=False)

    user = db.relationship("User", back_populates="roles")
    role = db.relationship("Role", back_populates="users")


class RolePermission(db.Model):
    __tablename__ = "role_permissions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    role_id = db.Column(db.String(36), db.ForeignKey("roles.id"), nullable=False)
    permission_id = db.Column(db.String(36), db.ForeignKey("permissions.id"), nullable=False)

    role = db.relationship("Role", back_populates="permissions")
    permission = db.relationship("Permission")
