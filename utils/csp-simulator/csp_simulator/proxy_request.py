import pathlib
import urllib.parse

import flask
import requests


def proxy(base_remote_url: str, path: str, headers: dict = None) -> requests.Response:
    outbound_url_parts = urllib.parse.urlparse(base_remote_url)
    outbound_url_parts = outbound_url_parts._replace(
        path=str(pathlib.Path("/") / pathlib.Path(path))
    )
    outbound_url = urllib.parse.urlunparse(outbound_url_parts)

    return requests.request(
        method=flask.request.method,
        url=outbound_url,
        headers=headers,
        params=flask.request.args,
        data=flask.request.get_data(),
        allow_redirects=False,
    )
