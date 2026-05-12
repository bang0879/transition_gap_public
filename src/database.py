"""
SQLite 헬퍼.

진단 응답을 세션 단위로 저장한다.
"""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

DB_PATH = Path("data/transition_gap.db")


def init_db() -> None:
    """DB 및 테이블 초기 생성. 앱 시작 시 호출."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_alias TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                responses TEXT NOT NULL,
                current_step TEXT NOT NULL
            )
        """)
        conn.commit()


def save_session(
    responses: dict,
    current_step: str,
    company_alias: Optional[str] = None,
    session_id: Optional[int] = None,
) -> int:
    """세션 저장 (insert 또는 update). 세션 ID 반환."""
    now = datetime.now().isoformat()
    responses_json = json.dumps(responses, ensure_ascii=False)

    with sqlite3.connect(DB_PATH) as conn:
        if session_id is None:
            cursor = conn.execute(
                "INSERT INTO sessions (company_alias, created_at, updated_at, responses, current_step) "
                "VALUES (?, ?, ?, ?, ?)",
                (company_alias, now, now, responses_json, current_step),
            )
            session_id = cursor.lastrowid
        else:
            conn.execute(
                "UPDATE sessions SET updated_at = ?, responses = ?, current_step = ? WHERE id = ?",
                (now, responses_json, current_step, session_id),
            )
        conn.commit()

    return session_id  # type: ignore


def load_session(session_id: int) -> Optional[dict]:
    """세션 로드."""
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT id, company_alias, created_at, updated_at, responses, current_step "
            "FROM sessions WHERE id = ?",
            (session_id,),
        ).fetchone()

    if row is None:
        return None

    return {
        "id": row[0],
        "company_alias": row[1],
        "created_at": row[2],
        "updated_at": row[3],
        "responses": json.loads(row[4]),
        "current_step": row[5],
    }
