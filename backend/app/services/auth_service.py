import argon2


class AuthService:
    def __init__(self):
        self.ph = argon2.PasswordHasher()

    def login(self, username: str, password: str) -> str | None:
        # TODO: implement login logic with database lookup
        return None

    def list_users(self) -> list:
        # TODO: implement user listing
        return []

    def get_user(self, user_id: str) -> dict | None:
        # TODO: implement user retrieval
        return None

    def create_user(self, data: dict) -> dict | None:
        # TODO: implement user creation with password hashing
        return None

    def update_user(self, user_id: str, data: dict) -> dict | None:
        # TODO: implement user update
        return None

    def assign_role(self, user_id: str, role_id: str) -> bool:
        # TODO: implement role assignment
        return False

    def hash_password(self, password: str) -> str:
        return self.ph.hash(password)

    def verify_password(self, hash_value: str, password: str) -> bool:
        try:
            return self.ph.verify(hash_value, password)
        except argon2.exceptions.VerifyMismatchError:
            return False
