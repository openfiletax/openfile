"""
Endpoints for login/logout (SADI) and profile services (SADI IDPs).
"""

__all__ = "auth_bp"

import uuid

import flask

from .contants import IAL
from .user_service import get_user, login_user, put_user

auth_bp = flask.Blueprint("auth", __name__)
auth_bp.tid_property = "tid"
auth_bp.email_property = "email"
auth_bp.subscriber_property = "sub"
auth_bp.ial_property = "ial"
auth_bp.client_base_path = None


@auth_bp.record
def record(setup_data):
    app = setup_data.app
    auth_bp.client_base_path = app.config.get("CLIENT_BASE_PATH")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if flask.request.method == "POST":
        email = flask.request.form[auth_bp.email_property].lower()
        ial_value = flask.request.form[auth_bp.ial_property]

        user_info = login_user(email, ial_value)

        flask.session.permanent = True
        flask.session[auth_bp.tid_property] = uuid.uuid4()
        flask.session[auth_bp.subscriber_property] = user_info.sub
        flask.session[auth_bp.email_property] = user_info.email
        flask.session[auth_bp.ial_property] = user_info.ial

        if next_url := flask.request.args.get("next"):
            return flask.redirect(next_url)

        return flask.redirect(auth_bp.client_base_path)
    return f"""
    <form method="post">
        <p>
            <label for="email">Email</label>
            <input type="email" name="{auth_bp.email_property}" required>
        </p>
        <p>
            <input type="radio" id="ial1" name="ial" value="{IAL.IAL1}" required>
            <label for="ial1">{IAL.IAL1}</label>
            <input type="radio" id="ial2" name="ial" value="{IAL.IAL2}">
            <label for="ial2">{IAL.IAL2}</label>
        </p>
        <p><input type="submit" value="Login">
    </form>
    """


@auth_bp.route("/logout", methods=["GET"])
def logout():
    flask.session.clear()
    return f"""
    <p>You are logged out</p>
    <p><a href="/">Return to start</a>
    """


@auth_bp.route("/user_profile", methods=["GET"])
def user_profile():
    sub_uuid_str = flask.request.args.get("sub")
    user_info = get_user(sub_uuid_str)
    if user_info is None:
        return {}, 404

    return f"""
    <form method="post">
        <input type="hidden" name="sub_uuid" value="{str(user_info.sub)}">
        <p>
            <label for="email">Email</label>
            <input type="email" name="{auth_bp.email_property}" value={user_info.email} disabled="true">
        </p>
        <p>
            <label for="email">First Name</label>
            <input type="first_name" name="first_name" value={user_info.first_name or ""}>
            <label for="last_name">Last Name</label>
            <input type="text" name="last_name" value={user_info.last_name or ""}>
        </p>
        <p>
            <label for="tin">TIN</label>
            <input type="text" name="tin" value={user_info.tin or ""}>
        </p>
        <p><input type="submit" value="Update">
    </form>
    """


@auth_bp.route("/user_profile", methods=["POST"])
def user_profile_post():
    form_data = flask.request.form
    sub_uuid_str = form_data.get("sub_uuid")
    user_info = get_user(sub_uuid_str)
    if user_info is None:
        return {}, 404

    user_info.email = form_data.get("email")
    user_info.first_name = form_data.get("first_name")
    user_info.last_name = form_data.get("last_name")
    user_info.tin = form_data.get("tin")

    put_user(user_info)

    return "Success.  Close this tab."
