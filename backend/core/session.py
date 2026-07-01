from typing import Optional
from models.debate import DebateSession

_sessions: dict[str, DebateSession] = {}


def create_session(session: DebateSession) -> None:
    _sessions[session.session_id] = session


def get_session(session_id: str) -> Optional[DebateSession]:
    return _sessions.get(session_id)


def update_session(session: DebateSession) -> None:
    _sessions[session.session_id] = session


def delete_session(session_id: str) -> None:
    _sessions.pop(session_id, None)
