from flask import Flask
from flask_cors import CORS


def create_app(config_name="default"):
    app = Flask(__name__)

    # Load configuration
    if config_name == "testing":
        app.config.from_object(TestConfig)
    else:
        app.config.from_object(ProductionConfig)

    # Initialize extensions
    CORS(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.documents import documents_bp
    from app.routes.users import users_bp
    from app.routes.workflow import workflow_bp
    from app.routes.ocr import ocr_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(documents_bp, url_prefix="/api/documents")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(workflow_bp, url_prefix="/api/workflow")
    app.register_blueprint(ocr_bp, url_prefix="/api/ocr")

    return app


class ProductionConfig:
    SECRET_KEY = "change-me-in-production"
    SQLALCHEMY_DATABASE_URI = "sqlite:///fluxis.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = "/app/storage/uploads"
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
