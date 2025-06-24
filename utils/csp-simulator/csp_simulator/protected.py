"""
Proxy requests to authenticated services.  Requests will be forwarded to the
configured backend with the SiteMinder headers set.
"""

__all__ = "protected_bp_factory"

import urllib.parse
import uuid

import flask
import werkzeug.datastructures

from .contants import IAL
from .proxy_request import proxy
from .user_service import get_user

HEADERS_TO_EXCLUDE_FROM_RESPONSE = {
    "content-encoding",
    "content-length",
    "transfer-encoding",
    "connection",
    "server",
    "set-cookie",
    "date",
}
HEADERS_TO_EXCLUDE_FROM_PROXIED_REQUEST = {
    "host",
    "sm_universalid",
    "tid",
    "via",
}


def protected_bp_factory(backend_base_url: str, minimum_ial: IAL):
    protected_bp = flask.Blueprint(f"proxy-{uuid.uuid4()}", __name__)
    protected_bp.subscriber_property = "sub"
    protected_bp.tid_property = "tid"
    protected_bp.backend_base_url = backend_base_url
    protected_bp.csp_login_path = None
    protected_bp.minimum_ial = minimum_ial
    protected_bp.fake_public_ip_address_to_prepend_to_x_forwarded_for = None

    @protected_bp.record
    def record(setup_data):
        app = setup_data.app
        protected_bp.csp_login_path = app.config.get("CSP_LOGIN_PATH")
        protected_bp.fake_public_ip_address_to_prepend_to_x_forwarded_for = (
            app.config.get("FAKE_PUBLIC_IP_ADDRESS_TO_PREPEND_TO_X_FORWARDED_FOR")
        )

    def _get_outbound_headers(
        inbound_headers: werkzeug.datastructures.Headers,
        user_sub: uuid.UUID,
        tid_value: uuid.UUID,
    ) -> dict:
        outbound_headers = {
            k: v
            for k, v in inbound_headers
            if k.lower() not in HEADERS_TO_EXCLUDE_FROM_PROXIED_REQUEST
        }
        outbound_headers["SM_UNIVERSALID"] = str(user_sub)
        outbound_headers["TID"] = str(
            tid_value
        )  # persisted through session (from SADI)
        outbound_headers["VIA"] = "CSP Simulator"

        if protected_bp.fake_public_ip_address_to_prepend_to_x_forwarded_for:
            outbound_headers["True-Client-IP"] = (
                protected_bp.fake_public_ip_address_to_prepend_to_x_forwarded_for.split(
                    ","
                )[0].strip()
            )
        else:
            client_addr = flask.request.remote_addr
            if x_forwarded_for_header_value := inbound_headers.get("X-Forwarded-For"):
                x_forwarded_for_addresses = x_forwarded_for_header_value.split(",")
                if len(x_forwarded_for_addresses) > 0:
                    client_addr = x_forwarded_for_addresses[0].strip()
            outbound_headers["True-Client-IP"] = client_addr

        x_forwarded_for_components = inbound_headers.get("X-Forwarded-For", "").split(
            ","
        )
        x_forwarded_for_components.append(flask.request.remote_addr)
        if protected_bp.fake_public_ip_address_to_prepend_to_x_forwarded_for:
            x_forwarded_for_components.insert(
                0, protected_bp.fake_public_ip_address_to_prepend_to_x_forwarded_for
            )
        outbound_headers["X-Forwarded-For"] = ", ".join(
            c for c in x_forwarded_for_components if c != ""
        )

        user_info = get_user(user_sub)
        outbound_headers["AUTH_LEVEL"] = user_info.ial

        return outbound_headers

    @protected_bp.before_request
    def validate_session():
        user_sub = flask.session.get(protected_bp.subscriber_property, None)
        if user_sub is None:
            flask.session.clear()
            return flask.redirect(
                f"{protected_bp.csp_login_path}?{urllib.parse.urlencode({'next': flask.request.path})}",
                code=307,
            )

        if protected_bp.minimum_ial == IAL.IAL2:
            user_info = get_user(user_sub)
            if not user_info or user_info.ial != IAL.IAL2:
                return (
                    f"""
                <p>Unauthorized</p>
                <a href="{protected_bp.csp_login_path}">Login as another user</a>
                """,
                    403,
                )

    @protected_bp.route(
        "/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
    )
    @protected_bp.route(
        "/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
    )
    def proxy_all(path: str):
        outbound_headers = _get_outbound_headers(
            flask.request.headers,
            flask.session.get(protected_bp.subscriber_property),
            flask.session.get(protected_bp.tid_property),
        )
        service_response = proxy(
            protected_bp.backend_base_url, flask.request.path, headers=outbound_headers
        )

        proxy_response_headers = [
            (k, v)
            for k, v in service_response.headers.items()
            if k.lower() not in HEADERS_TO_EXCLUDE_FROM_RESPONSE
        ]

        proxy_response = flask.Response(
            service_response.content,
            service_response.status_code,
            proxy_response_headers,
        )
        return proxy_response

    return protected_bp
