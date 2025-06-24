"""
SADI internal services (get user details)
"""

__all__ = "internal_bp"

import flask

from .user_service import generate_fake_user_data, get_user

USER_DATA_ELEMENT_QUERY_PARAM = "a"
USER_DATA_ELEMENT_MAP = {
    "TIN": "tin",
    "DATEOFBIRTH": "date_of_birth",
    "EMAILADDRESS": "email",
    "LANDLINENUMBER": "landline_number",
    "MOBILENUMBER": "mobile_number",
    "IRSCREATEDATE": "irs_create_date",
    "GIVENNAME": "first_name",
    "SURNAME": "last_name",
    "MIDDLENAME": "middle_name",
    "MAILINGADDRESS": "mailing_address",
    "STREETADDRESSLINE1": "street_address_line1",
    "STREETADDRESSLINE2": "street_address_line2",
    "CITY": "city",
    "STATE": "state",
    "ZIP": "zip",
}

internal_bp = flask.Blueprint("internal", __name__)
internal_bp.service_account_name = None
internal_bp.generate_pii_when_missing = False


@internal_bp.record
def record(setup_data):
    app = setup_data.app
    internal_config = app.config.get("INTERNAL", {})
    internal_bp.service_account_name = internal_config.get("SERVICE_ACCOUNT_NAME")
    internal_bp.generate_pii_when_missing = internal_config.get(
        "GENERATE_PII_WHEN_MISSING"
    )


class ServiceAccountError(ValueError):
    pass


@internal_bp.errorhandler(ServiceAccountError)
def handle_service_account_error(e: ServiceAccountError):
    return {"message": str(e)}, 401


@internal_bp.before_request
def validate_service_account():
    if (
        internal_bp.service_account_name is None
        or flask.request.headers.get("serviceId") != internal_bp.service_account_name
    ):
        raise ServiceAccountError("Invalid service account")


@internal_bp.route("/user_detail", methods=["POST"])
def user_detail():
    requested_sub = flask.request.data.decode("utf-8")
    if requested_sub is None:
        return {}, 404
    requested_user_info = get_user(requested_sub)
    if requested_user_info is None:
        if internal_bp.generate_pii_when_missing is True:
            user_info = generate_fake_user_data(requested_sub)
        else:
            return {}, 404
    else:
        user_info = generate_fake_user_data(requested_sub)
        user_info.email = requested_user_info.email
        user_info.tin = requested_user_info.tin

    # Note: This does not filter for element access based on IAL
    #       nor does it return appropriate errors if an element is invalid
    requested_elements = flask.request.args.getlist(USER_DATA_ELEMENT_QUERY_PARAM)
    return {
        el: getattr(user_info, USER_DATA_ELEMENT_MAP[el]) for el in requested_elements
    }
