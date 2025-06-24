__all__ = ("database_init", "store_user", "fetch_user")

import sqlite3
import typing
import uuid

DB_FILENAME: str = "not_set"


def database_init(db_filename: str):
    global DB_FILENAME
    DB_FILENAME = db_filename
    with sqlite3.connect(db_filename) as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY, data JSON NOT NULL)"
        )


def store_user(sub_uuid: uuid.UUID, data: str):
    with sqlite3.connect(DB_FILENAME) as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = ?",
            (str(sub_uuid), data, data),
        )


def fetch_user(sub_uuid: uuid.UUID) -> typing.Optional[str]:
    with sqlite3.connect(DB_FILENAME) as conn:
        cur = conn.cursor()
        res = cur.execute("SELECT data FROM users WHERE id = ?", (str(sub_uuid),))
        row = res.fetchone()
        if row is None:
            return
        return row[0]
