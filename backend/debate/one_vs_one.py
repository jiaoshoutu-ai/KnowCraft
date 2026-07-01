import json
import uuid
from typing import AsyncIterator, List

from api.topics import get_topic_by_id
from config import settings
from models.debate import DebateMessage, DebateScores, DebateSession, Evaluation
from prompts.debate import build_opponent_prompt
from prompts.evaluation import build_evaluation_prompt

# Use mock adapter if no API key is configured
if settings.dashscope_api_key and settings.dashscope_api_key != "your_api_key_here":
    from core import llm_adapter, qwen_adapter
    LLMAdapter = llm_adapter.LLMAdapter
    QwenAdapter = qwen_adapter.QwenAdapter
    llm = QwenAdapter()
else:
    from core.mock_adapter import MockLLMAdapter
    llm = MockLLMAdapter()


def create_debate_session(topic_id: str, perspective_id: str) -> DebateSession:
    topic = get_topic_by_id(topic_id)
    perspective = topic.get_perspective(perspective_id)
    if not perspective:
        raise ValueError(f"Perspective not found: {perspective_id}")
    return DebateSession(
        session_id=str(uuid.uuid4()),
        topic_id=topic_id,
        perspective_id=perspective_id,
        max_rounds=settings.debate_max_rounds,
    )


async def generate_opponent_message(
    session: DebateSession,
    is_opening: bool = False,
) -> AsyncIterator[str]:
    """Stream AI opponent's response."""
    topic = get_topic_by_id(session.topic_id)
    perspective = topic.get_perspective(session.perspective_id)

    system = build_opponent_prompt(
        role_name=perspective.name,
        stance=perspective.stance,
        description=perspective.description,
        topic_title=topic.title,
        topic_summary=topic.summary,
        round_number=session.round_number,
        max_rounds=session.max_rounds,
        is_opening=is_opening,
    )

    # Build message history for context (last 6 messages max to stay within token limits)
    history = []
    for msg in session.messages[-6:]:
        history.append({"role": "user" if msg.role == "user" else "assistant", "content": msg.content})

    async for chunk in llm.stream(history, system):
        yield chunk


async def evaluate_debate(session: DebateSession) -> Evaluation:
    """Evaluate the full debate using LLM."""
    topic = get_topic_by_id(session.topic_id)
    perspective = topic.get_perspective(session.perspective_id)

    # Build conversation text
    lines = []
    for msg in session.messages:
        label = "学生" if msg.role == "user" else msg.speaker
        lines.append(f"【{label}】{msg.content}")
    conversation = "\n".join(lines)

    # Find user's stance (opposite of AI opponent)
    user_stance = "学生自由立场（与AI对手相对）"

    prompt = build_evaluation_prompt(
        topic_title=topic.title,
        user_stance=user_stance,
        opponent_stance=perspective.stance,
        conversation=conversation,
    )

    raw = await llm.chat([], prompt, max_tokens=800, temperature=0.3)

    # Parse JSON from response (handle markdown code blocks)
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    data = json.loads(text)
    return Evaluation(
        scores=DebateScores(**data["scores"]),
        total_score=data["total_score"],
        strengths=data["strengths"],
        improvements=data["improvements"],
        summary=data["summary"],
    )
