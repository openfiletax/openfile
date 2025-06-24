__all__ = ("login_user", "put_user", "get_user", "generate_fake_user_data")

import dataclasses
import hashlib
import json
import typing
import uuid

from .contants import IAL
from .database import fetch_user, store_user


@dataclasses.dataclass
class UserInfo:
    sub: uuid.UUID
    email: str
    ial: IAL
    first_name: typing.Optional[str] = None
    middle_name: typing.Optional[str] = None
    last_name: typing.Optional[str] = None
    tin: typing.Optional[str] = None
    landline_number: typing.Optional[str] = None
    mobile_number: typing.Optional[str] = None
    date_of_birth: typing.Optional[str] = None
    irs_create_date: typing.Optional[str] = None
    mailing_address: typing.Optional[str] = None
    street_address_line1: typing.Optional[str] = None
    street_address_line2: typing.Optional[str] = None
    city: typing.Optional[str] = None
    state: typing.Optional[str] = None
    zip: typing.Optional[str] = None

    def __post_init__(self):
        if isinstance(self.sub, str):
            object.__setattr__(self, "sub", uuid.UUID(self.sub))
        if isinstance(self.ial, str):
            object.__setattr__(self, "ial", IAL(self.ial))


class UserInfoJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, uuid.UUID):
            return str(o)
        if isinstance(o, IAL):
            return str(IAL)

        return super().default(o)


def login_user(email: str, ial_value: str) -> UserInfo:
    # CWE-327 -- dismissing because we aren't concerned with hash conflicts in CSP simulator since it's just a test utility
    # nosemgrep: bandit.B303-2
    sha1 = hashlib.sha1()
    sha1.update(f"{email}:{ial_value}".encode("utf-8"))
    sub_uuid = uuid.UUID(sha1.hexdigest()[:32])

    user_info = get_user(sub_uuid)
    if user_info is None:
        predictable_last_four = int.from_bytes(sha1.digest()[0:2]) % 9999
        user_info = UserInfo(
            sub=sub_uuid,
            email=email,
            ial=IAL(ial_value),
            tin=f"123-00-{predictable_last_four:04d}",
        )
        put_user(user_info)
    return user_info


def put_user(user_info: UserInfo):
    store_user(
        user_info.sub,
        json.dumps(dataclasses.asdict(user_info), cls=UserInfoJSONEncoder),
    )


def get_user(sub_uuid: uuid.UUID | str) -> typing.Optional[UserInfo]:
    user_data_str = fetch_user(sub_uuid)
    if user_data_str is None:
        return
    user_data = json.loads(user_data_str)
    return UserInfo(**user_data)


def generate_fake_user_data(sub_uuid: uuid.UUID | str) -> UserInfo:
    # CWE-327 -- dismissing because we aren't concerned with hash conflicts in CSP simulator since it's just a test utility
    # nosemgrep: bandit.B303-2
    sha1 = hashlib.sha1()
    predictable_last_four = int.from_bytes(sha1.digest()[0:2]) % 9999
    email = f"fake.user-{predictable_last_four}@example.com"
    return UserInfo(
        sub=uuid.UUID(sub_uuid),
        email=email,
        ial=IAL.IAL2,
        first_name=f"Firstname-{predictable_last_four:04d}",
        middle_name=f"Middlename-{predictable_last_four:04d}",
        last_name=f"Lastname-{predictable_last_four:04d}",
        tin=f"12300{predictable_last_four:04d}",
        mobile_number=f"1555555{predictable_last_four:04d}",
        landline_number=f"1666666{predictable_last_four:04d}",
        date_of_birth="1970-01-01",
        irs_create_date="2024-01-01",
        mailing_address=f"P.O. Box {predictable_last_four:04d}",
        street_address_line1=f"{predictable_last_four:04d} Hickory Lane",
        street_address_line2=f"Apt {predictable_last_four:04d}",
        city="Somewhere",
        state="TX",
        zip=f"5{predictable_last_four:04d}",
    )
