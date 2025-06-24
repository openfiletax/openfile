__all__ = "create_app"

import datetime
import os
import secrets
import urllib.parse

import flask

from .auth import auth_bp
from .contants import IAL
from .database import database_init
from .internal import internal_bp
from .protected import protected_bp_factory

CONFIG_DEFAULTS = {
    "SESSION_COOKIE_NAME": "PAINT.SADIApp-RUP",
    "SESSION_COOKIE_SAMESITE": "Strict",
    "SESSION_COOKIE_SECURE": True,
    "SESSION_TIMEOUT_MINUTES": 15,
    "CSP_LOGIN_PATH": "/auth/login",
    "CSP_LOGOUT_PATH_ALT": "/secureaccess/ui/protected/logout",
    "BACKEND_BASE_URL": "http://localhost:8080",
    "BACKEND_BASE_PATH": "/df/file/api",
    "CLIENT_BASE_URL": "http://localhost:3000",
    "CLIENT_BASE_PATH": "/df/file",
    "INTERNAL": {"SERVICE_ACCOUNT_NAME": "admin1", "GENERATE_PII_WHEN_MISSING": False},
    "DATABASE_FILE": "csp_simulator.sqlite3",
    "FAKE_PUBLIC_IP_ADDRESS_TO_PREPEND_TO_X_FORWARDED_FOR": None,
}


def create_app() -> flask.Flask:
    app = flask.Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_mapping(CONFIG_DEFAULTS)

    if os.getenv("DISABLE_SESSION_COOKIE_SECURITY", "False").lower() == "true":
        app.config["SESSION_COOKIE_SECURE"] = False

    app.secret_key = os.getenv("FLASK_SECRET_KEY", secrets.token_hex(16))
    app.config.from_prefixed_env("CSPSIM")

    session_timeout_minutes = app.config.get("SESSION_TIMEOUT_MINUTES")
    app.permanent_session_lifetime = datetime.timedelta(minutes=session_timeout_minutes)
    client_base_path = app.config.get("CLIENT_BASE_PATH")
    backend_base_path = app.config.get("BACKEND_BASE_PATH")

    database_file = app.config.get("DATABASE_FILE")
    database_init(database_file)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(internal_bp, url_prefix="/internal")

    backend_proxy_bp = protected_bp_factory(
        app.config.get("BACKEND_BASE_URL"), IAL.IAL2
    )
    app.register_blueprint(backend_proxy_bp, url_prefix=backend_base_path)
    client_proxy_bp = protected_bp_factory(app.config.get("CLIENT_BASE_URL"), IAL.IAL2)
    app.register_blueprint(client_proxy_bp, url_prefix=client_base_path)

    @app.route("/")
    def root_redirect():
        return f"""
        <p>Welcome to Direct File</p>
        <p><a href="{client_base_path}">Start your taxes</a>
        """

    csp_logout_path_alt = app.config.get("CSP_LOGOUT_PATH_ALT")

    @app.route(csp_logout_path_alt)
    def alternate_logout_url():
        return flask.redirect("/auth/logout", code=307)

    @app.after_request
    def after_request_filter(response: flask.Response):
        if location := response.headers.get("Location"):
            if "apps.internal" in location and 300 <= response.status_code < 400:
                # rewrite apps.internal hosts with just the location path
                url_parts = urllib.parse.urlparse(location)
                response.headers.pop("Location")
                response.headers["Location"] = url_parts.path
        return response

    return app
