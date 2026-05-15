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


def save_response_immediately(
    variable_id: str,
    value,
    session_id: Optional[int],
    current_step: str,
) -> int:
    """
    단일 변수 응답을 SQLite에 즉시 저장한다.

    Args:
        variable_id: 응답 변수 ID.
        value: 저장할 응답 값.
        session_id: 기존 세션 ID. 없으면 새 세션 생성.
        current_step: 현재 진행 단계.

    Returns:
        세션 ID.
    """
    now = datetime.now().isoformat()

    with sqlite3.connect(DB_PATH) as conn:
        if session_id is None:
            responses_dict = {variable_id: value}
            responses_json = json.dumps(responses_dict, ensure_ascii=False)
            cursor = conn.execute(
                "INSERT INTO sessions (company_alias, created_at, updated_at, responses, current_step) "
                "VALUES (?, ?, ?, ?, ?)",
                (None, now, now, responses_json, current_step),
            )
            conn.commit()
            return cursor.lastrowid  # type: ignore

        row = conn.execute(
            "SELECT responses FROM sessions WHERE id = ?",
            (session_id,),
        ).fetchone()

        if row is None:
            responses_dict = {variable_id: value}
            responses_json = json.dumps(responses_dict, ensure_ascii=False)
            cursor = conn.execute(
                "INSERT INTO sessions (company_alias, created_at, updated_at, responses, current_step) "
                "VALUES (?, ?, ?, ?, ?)",
                (None, now, now, responses_json, current_step),
            )
            conn.commit()
            return cursor.lastrowid  # type: ignore

        existing = json.loads(row[0]) if row[0] else {}
        existing[variable_id] = value
        responses_json = json.dumps(existing, ensure_ascii=False)

        conn.execute(
            "UPDATE sessions SET updated_at = ?, responses = ? WHERE id = ?",
            (now, responses_json, session_id),
        )
        conn.commit()

    return session_id


def load_responses_from_db(session_id: int) -> dict:
    """SQLite에서 응답 dict를 로드한다. 세션이 없으면 빈 dict를 반환한다."""
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT responses FROM sessions WHERE id = ?",
            (session_id,),
        ).fetchone()

    if row is None:
        return {}
    return json.loads(row[0]) if row[0] else {}


def load_latest_session_snapshot() -> Optional[dict]:
    """가장 최근 세션의 최소 복원 정보를 반환한다."""
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT id, responses, current_step FROM sessions "
            "ORDER BY updated_at DESC LIMIT 1"
        ).fetchone()

    if row is None:
        return None

    return {
        "id": row[0],
        "responses": json.loads(row[1]) if row[1] else {},
        "current_step": row[2],
    }


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
