import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from config import settings
from database import async_session_maker
from core.session import create_session, get_session, update_session, delete_session
from debate.one_vs_one import create_debate_session, generate_opponent_message, evaluate_debate
from models.debate import DebateMessageCreate, Stance
from models.db_models import (
    User,
    DebateSession as DebateSessionDB,
    DebateMessage as DebateMessageDB,
    Evaluation as EvaluationDB,
    Stance as StanceDB,
    DebatePhase,
    Difficulty as DifficultyDB,
    UserRole,
)

router = APIRouter()


def _decode_user_id_from_token(token: Optional[str]) -> Optional[str]:
    """Decode JWT token and return user_id, or None if invalid/missing."""
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload.get("sub")
    except JWTError:
        return None


async def _get_active_user_id(user_id: Optional[str]) -> Optional[str]:
    """Return active user id and clean expired guest users."""
    if not user_id:
        return None

    expired_before = datetime.utcnow() - timedelta(days=1)
    async with async_session_maker() as db:
        expired_result = await db.execute(
            select(User)
            .options(selectinload(User.debate_sessions).selectinload(DebateSessionDB.messages))
            .options(selectinload(User.debate_sessions).selectinload(DebateSessionDB.evaluation))
            .where(User.role == UserRole.GUEST)
            .where(User.last_active_at < expired_before)
        )
        for expired_guest in expired_result.scalars().all():
            await db.delete(expired_guest)

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            await db.commit()
            return None

        if user.role == UserRole.GUEST and user.last_active_at < expired_before:
            guest_result = await db.execute(
                select(User)
                .options(selectinload(User.debate_sessions).selectinload(DebateSessionDB.messages))
                .options(selectinload(User.debate_sessions).selectinload(DebateSessionDB.evaluation))
                .where(User.id == user.id)
            )
            expired_guest = guest_result.scalar_one_or_none()
            if expired_guest is not None:
                await db.delete(expired_guest)
            await db.commit()
            return None

        user.last_active_at = datetime.utcnow()
        await db.commit()
        return user.id


async def _persist_debate_result(session, evaluation: dict) -> None:
    """Persist a completed debate session, messages, and evaluation to DB."""
    user_id = session.user_id
    if not user_id:
        # Anonymous debate — nothing to persist under a user
        return

    scores = evaluation.get("scores", {})
    total_score = evaluation.get("total_score") or (
        scores.get("logic", 0)
        + scores.get("evidence", 0)
        + scores.get("expression", 0)
        + scores.get("rebuttal", 0)
        + scores.get("critical_thinking", 0)
    )

    async with async_session_maker() as db:
        # 1. DebateSession row
        db_session = DebateSessionDB(
            session_id=session.session_id,
            user_id=user_id,
            topic_id=session.topic_id,
            debate_topic_id=session.debate_topic_id,
            user_stance=StanceDB(session.user_stance.value),
            ai_stance=StanceDB(session.ai_stance.value),
            round_number=session.round_number,
            max_rounds=session.max_rounds,
            difficulty=DifficultyDB(session.difficulty.value),
            phase=DebatePhase.DONE,
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
        )
        db.add(db_session)

        # 2. DebateMessage rows
        for msg in session.messages:
            db.add(DebateMessageDB(
                session_id=session.session_id,
                role=msg.role,
                stance=StanceDB(msg.stance.value),
                content=msg.content,
                timestamp=datetime.utcnow(),
            ))

        # 3. Evaluation row
        db.add(EvaluationDB(
            session_id=session.session_id,
            logic=int(scores.get("logic", 0)),
            evidence=int(scores.get("evidence", 0)),
            expression=int(scores.get("expression", 0)),
            rebuttal=int(scores.get("rebuttal", 0)),
            critical_thinking=int(scores.get("critical_thinking", 0)),
            strengths=list(evaluation.get("strengths") or []),
            improvements=list(evaluation.get("improvements") or []),
            summary=str(evaluation.get("summary", "")),
        ))

        # 4. Update user stats
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is not None:
            new_count = user.debate_count + 1
            new_avg = (
                (user.average_score * user.debate_count + total_score)
                / new_count
                if new_count > 0
                else user.average_score
            )
            user.debate_count = new_count
            user.average_score = round(new_avg, 2)
            user.last_active_at = datetime.utcnow()

        await db.commit()


async def _send_json(ws: WebSocket, data: dict):
    await ws.send_text(json.dumps(data, ensure_ascii=False))


async def _send_error(ws: WebSocket, message: str):
    await _send_json(ws, {"type": "error", "data": {"message": message}})


async def _complete_debate(ws: WebSocket, session) -> None:
    """Generate, persist, and send final evaluation for a debate session."""
    print(
        "[Debate Evaluation] Start:",
        {
            "session_id": session.session_id,
            "topic_id": session.topic_id,
            "debate_topic_id": session.debate_topic_id,
            "round_number": session.round_number,
            "messages": len(session.messages),
        },
    )

    session.phase = "evaluating"
    update_session(session)

    await _send_json(ws, {
        "type": "system",
        "session_id": session.session_id,
        "data": {"event": "debate_ended", "round": session.round_number},
    })

    try:
        evaluation = await evaluate_debate(session)
    except Exception as e:
        import traceback
        print(
            "[Debate Evaluation] Failed:",
            {
                "session_id": session.session_id,
                "topic_id": session.topic_id,
                "debate_topic_id": session.debate_topic_id,
                "error": str(e),
            },
        )
        traceback.print_exc()
        raise

    print(
        "[Debate Evaluation] Generated:",
        {
            "session_id": session.session_id,
            "total_score": evaluation.get("total_score"),
            "strengths": len(evaluation.get("strengths") or []),
            "improvements": len(evaluation.get("improvements") or []),
        },
    )
    session.phase = "done"
    update_session(session)

    # Persist to database (best-effort; don't block WS on failure)
    try:
        await _persist_debate_result(session, evaluation)
    except Exception as e:
        import traceback
        print(f"[Persist Error] Failed to save debate result: {e}")
        traceback.print_exc()

    await _send_json(ws, {
        "type": "evaluation",
        "session_id": session.session_id,
        "data": evaluation,
    })

    delete_session(session.session_id)


@router.websocket("/ws/debate")
async def debate_websocket(ws: WebSocket):
    await ws.accept()
    session = None

    # Extract user_id from JWT token in query string (?token=...)
    token = ws.query_params.get("token")
    user_id = await _get_active_user_id(_decode_user_id_from_token(token))

    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type")

            if msg_type == "start":
                topic_id = msg.get("topic_id")
                debate_topic_id = msg.get("debate_topic_id")
                user_stance_str = msg.get("user_stance")

                if not topic_id or not debate_topic_id or not user_stance_str:
                    await _send_error(ws, "Missing topic_id, debate_topic_id, or user_stance")
                    continue

                # Validate stance
                try:
                    user_stance = Stance(user_stance_str)
                except ValueError:
                    await _send_error(ws, f"Invalid stance: {user_stance_str}. Must be 'pro' or 'con'")
                    continue

                try:
                    session = await create_debate_session(
                        topic_id,
                        debate_topic_id,
                        user_stance,
                        user_id=user_id,
                    )
                except ValueError as e:
                    await _send_error(ws, str(e))
                    continue

                create_session(session)

                # Send session created
                await _send_json(ws, {
                    "type": "system",
                    "session_id": session.session_id,
                    "data": {
                        "event": "session_created",
                        "max_rounds": session.max_rounds,
                        "user_stance": session.user_stance.value,
                        "ai_stance": session.ai_stance.value,
                        "debate_topic_title": session.debate_topic_title,
                        "pro_stance_desc": session.pro_stance_desc,
                        "con_stance_desc": session.con_stance_desc,
                        "opponent_emoji": session.opponent_emoji,
                        "opponent_name": session.opponent_name,
                    },
                })

                # AI opening message (streamed)
                full_content = ""
                await _send_json(ws, {
                    "type": "ai_message",
                    "session_id": session.session_id,
                    "data": {"content": "", "is_streaming": True},
                })
                async for chunk in generate_opponent_message(session, is_opening=True):
                    full_content += chunk
                    await _send_json(ws, {
                        "type": "ai_message",
                        "session_id": session.session_id,
                        "data": {"content": chunk, "is_streaming": True},
                    })

                # Send complete message
                await _send_json(ws, {
                    "type": "ai_message",
                    "session_id": session.session_id,
                    "data": {
                        "content": full_content,
                        "is_streaming": False,
                    },
                })

                # Update session
                session.messages.append(DebateMessageCreate(
                    role="ai",
                    stance=session.ai_stance,
                    content=full_content,
                ))
                session.phase = "debating"
                session.round_number = 1
                update_session(session)

                # Round start signal
                await _send_json(ws, {
                    "type": "system",
                    "session_id": session.session_id,
                    "data": {"event": "round_start", "round": 1},
                })

            elif msg_type == "user_message":
                if not session:
                    await _send_error(ws, "No active session")
                    continue
                if session.phase != "debating":
                    await _send_error(ws, f"Cannot send message in phase: {session.phase}")
                    continue

                content = msg.get("content", "").strip()
                if not content:
                    await _send_error(ws, "Empty message")
                    continue

                # Record user message
                session.messages.append(DebateMessageCreate(
                    role="user",
                    stance=session.user_stance,
                    content=content,
                ))
                update_session(session)

                # AI rebuttal (streamed)
                full_content = ""
                await _send_json(ws, {
                    "type": "ai_message",
                    "session_id": session.session_id,
                    "data": {"content": "", "is_streaming": True},
                })
                async for chunk in generate_opponent_message(session):
                    full_content += chunk
                    await _send_json(ws, {
                        "type": "ai_message",
                        "session_id": session.session_id,
                        "data": {"content": chunk, "is_streaming": True},
                    })

                await _send_json(ws, {
                    "type": "ai_message",
                    "session_id": session.session_id,
                    "data": {
                        "content": full_content,
                        "is_streaming": False,
                    },
                })

                # Record AI message
                session.messages.append(DebateMessageCreate(
                    role="ai",
                    stance=session.ai_stance,
                    content=full_content,
                ))

                # Check if debate should end
                if session.round_number >= session.max_rounds:
                    await _complete_debate(ws, session)
                else:
                    session.round_number += 1
                    update_session(session)
                    await _send_json(ws, {
                        "type": "system",
                        "session_id": session.session_id,
                        "data": {"event": "round_start", "round": session.round_number},
                    })

            elif msg_type == "end":
                if not session:
                    await _send_error(ws, "No active session")
                    continue
                if session.phase == "done":
                    continue
                if session.phase == "evaluating":
                    continue

                await _complete_debate(ws, session)

            else:
                await _send_error(ws, f"Unknown message type: {msg_type}")

    except WebSocketDisconnect:
        if session:
            delete_session(session.session_id)
    except Exception as e:
        import traceback
        print(f"WebSocket error: {e}")
        traceback.print_exc()
        await _send_error(ws, str(e))
        if session:
            delete_session(session.session_id)
