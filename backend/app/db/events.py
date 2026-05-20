"""SQLite event log storage."""
from __future__ import annotations

import json
import sqlite3
from collections.abc import Generator
from contextlib import contextmanager
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent.parent.parent / "events.db"


def _get_connection() -> sqlite3.Connection:
    """Return a SQLite connection, creating the file if needed."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Manage a SQLite connection with commit/rollback semantics."""
    conn = _get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Create the events table and indexes if they do not exist."""
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                page TEXT,
                metadata TEXT,
                timestamp TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )
        conn.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_events_session
            ON events (session_id)
            """
        )
        conn.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_events_type
            ON events (event_type)
            """
        )


def insert_event(
    session_id: str,
    event_type: str,
    page: str | None,
    metadata: dict[str, Any] | None,
    timestamp: str,
) -> int:
    """Insert an event and return its row ID."""
    init_db()
    metadata_json = json.dumps(metadata, ensure_ascii=False) if metadata else None
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO events (session_id, event_type, page, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?)
            """,
            (session_id, event_type, page, metadata_json, timestamp),
        )
        return int(cursor.lastrowid)
