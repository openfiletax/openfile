"""
Proxy requests to unauthenticated resources (the Direct File SPA)
"""

__all__ = "unprotected_bp"

import flask

from .proxy_request import proxy

unprotected_bp = flask.Blueprint("ui", __name__)
unprotected_bp.client_base_url = None

HEADERS_TO_EXCLUDE_FROM_RESPONSE = [
    "content-encoding",
    "content-length",
    "transfer-encoding",
    "connection",
]


@unprotected_bp.record
def record(setup_data):
    app = setup_data.app
    unprotected_bp.client_base_url = app.config.get("CLIENT_BASE_URL")


@unprotected_bp.route("/", defaults={"path": ""}, methods=["GET"])
@unprotected_bp.route("/<path:path>", methods=["GET"])
def proxy_all(path: str):
    service_response = proxy(unprotected_bp.client_base_url, path)

    proxy_response_headers = [
        (k, v)
        for k, v in service_response.raw.headers.items()
        if k.lower() not in HEADERS_TO_EXCLUDE_FROM_RESPONSE
    ]

    proxy_response = flask.Response(
        service_response.content, service_response.status_code, proxy_response_headers
    )
    return proxy_response
