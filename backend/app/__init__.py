from flask import Flask
from flask_cors import CORS

from app.config import Config, TestConfig
from app.extensions import db, migrate

INSECURE_SECRET_KEYS = {"", "change-me-in-production"}


def create_app(config_name="default"):
    app = Flask(__name__)

    # Load configuration
    if config_name == "testing":
        app.config.from_object(TestConfig)
    else:
        app.config.from_object(Config)

    if not app.testing and not app.debug and app.config.get("SECRET_KEY") in INSECURE_SECRET_KEYS:
        raise RuntimeError("Ustaw zmienną środowiskową SECRET_KEY na losową, tajną wartość.")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    if app.config["CORS_ORIGINS"]:
        CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.documents import documents_bp
    from app.routes.users import users_bp
    from app.routes.workflow import workflow_bp
    from app.routes.ocr import ocr_bp
    from app.routes.health import health_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(documents_bp, url_prefix="/api/documents")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(workflow_bp, url_prefix="/api/workflow")
    app.register_blueprint(ocr_bp, url_prefix="/api/ocr")
    app.register_blueprint(health_bp, url_prefix="/api/health")

    return app
