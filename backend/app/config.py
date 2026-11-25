import os
from dotenv import load_dotenv

load_dotenv()


def _split_csv(value):
    return [item.strip() for item in value.split(",") if item.strip()]


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "")
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///fluxis.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/app/storage/uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    # Puste = brak nagłówków CORS (frontend i API pod tym samym originem przez nginx).
    CORS_ORIGINS = _split_csv(os.getenv("CORS_ORIGINS", ""))
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")


class TestConfig:
    TESTING = True
    SECRET_KEY = "test-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = []
