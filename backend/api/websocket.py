import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.session import create_session, get_session, update_session, delete_session
from debate.one_vs_one import create_debate_session, generate_opponent_message, evaluate_debate
from models.debate import DebateMessageCreate, Stance

router = APIRouter()


async def _send_json(ws: WebSocket, data: dict):
    await ws.send_text(json.dumps(data, ensure_ascii=False))


async def _send_error(ws: WebSocket, message: str):
    await _send_json(ws, {"type": "error", "data": {"message": message}})


@router.websocket("/ws/debate")
async def debate_websocket(ws: WebSocket):
    await ws.accept()
    session = None

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
                    session = await create_debate_session(topic_id, debate_topic_id, user_stance)
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
                    session.phase = "evaluating"
                    update_session(session)
                    await _send_json(ws, {
                        "type": "system",
                        "session_id": session.session_id,
                        "data": {"event": "debate_ended", "round": session.round_number},
                    })
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

                session.phase = "evaluating"
                update_session(session)

                # Run evaluation
                evaluation = await evaluate_debate(session)
                session.phase = "done"
                update_session(session)

                await _send_json(ws, {
                    "type": "evaluation",
                    "session_id": session.session_id,
                    "data": evaluation,
                })

                delete_session(session.session_id)

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
