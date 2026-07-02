from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from debate.one_vs_one import DebateSessionInMemory

_sessions: dict[str, "DebateSessionInMemory"] = {}


def create_session(session: "DebateSessionInMemory") -> None:
    _sessions[session.session_id] = session


def get_session(session_id: str) -> Optional["DebateSessionInMemory"]:
    return _sessions.get(session_id)


def update_session(session: "DebateSessionInMemory") -> None:
    _sessions[session.session_id] = session


def delete_session(session_id: str) -> None:
    _sessions.pop(session_id, None)
