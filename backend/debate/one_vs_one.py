import json
import random
import uuid
from typing import AsyncIterator
from pydantic import BaseModel

from database import async_session_maker
from config import settings
from models.debate import (
    DebateMessage,
    DebateScores,
    Stance,
)
from prompts.debate import build_opponent_prompt
from prompts.evaluation import build_evaluation_prompt
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.db_models import Topic as TopicDB
from core import get_llm_adapter

# Get configured LLM adapter
llm = get_llm_adapter()

# Opponent name pool
OPPONENT_NAMES = [
    ("🐟", "网友·小鱼"),
    ("🦊", "网友·阿狐"),
    ("🐱", "网友·橘猫"),
    ("🦉", "网友·夜猫"),
    ("🐼", "网友·熊猫"),
    ("🦋", "网友·蝶影"),
    ("🐺", "网友·孤狼"),
    ("🦅", "网友·鹰眼"),
]


class DebateSessionInMemory(BaseModel):
    """In-memory debate session with topic details cached."""
    session_id: str
    topic_id: str
    debate_topic_id: str
    user_stance: Stance
    ai_stance: Stance
    max_rounds: int = 5
    round_number: int = 0
    phase: str = "init"
    messages: list = []

    # Cached topic data
    topic_title: str
    topic_summary: str
    debate_topic_title: str
    pro_stance_desc: str
    con_stance_desc: str

    # Opponent identity
    opponent_emoji: str = "🐟"
    opponent_name: str = "网友·小鱼"

    class Config:
        arbitrary_types_allowed = True


async def create_debate_session(
    topic_id: str,
    debate_topic_id: str,
    user_stance: Stance,
) -> DebateSessionInMemory:
    """Create a new debate session with pro/con stance model."""
    # Fetch topic data from database
    async with async_session_maker() as db:
        result = await db.execute(
            select(TopicDB)
            .options(
                selectinload(TopicDB.debate_topics)
            )
            .where(TopicDB.id == topic_id)
        )
        topic = result.scalar_one_or_none()

        if not topic:
            raise ValueError(f"Topic not found: {topic_id}")

        # Find the debate topic
        debate_topic = None
        for dt in topic.debate_topics:
            if dt.id == debate_topic_id:
                debate_topic = dt
                break

        if not debate_topic:
            raise ValueError(f"Debate topic not found: {debate_topic_id}")

    # Determine AI stance (opposite of user)
    ai_stance = Stance.CON if user_stance == Stance.PRO else Stance.PRO

    # Pick a random opponent identity
    opponent_emoji, opponent_name = random.choice(OPPONENT_NAMES)

    return DebateSessionInMemory(
        session_id=str(uuid.uuid4()),
        topic_id=topic_id,
        debate_topic_id=debate_topic_id,
        user_stance=user_stance,
        ai_stance=ai_stance,
        max_rounds=settings.debate_max_rounds,
        topic_title=topic.title,
        topic_summary=topic.summary,
        debate_topic_title=debate_topic.title,
        pro_stance_desc=debate_topic.pro_stance,
        con_stance_desc=debate_topic.con_stance,
        opponent_emoji=opponent_emoji,
        opponent_name=opponent_name,
    )


async def generate_opponent_message(
    session: DebateSessionInMemory,
    is_opening: bool = False,
) -> AsyncIterator[str]:
    """Stream AI opponent's response based on stance."""
    # Get stance descriptions
    if session.ai_stance == Stance.PRO:
        stance_desc = session.pro_stance_desc
        opponent_desc = session.con_stance_desc
    else:
        stance_desc = session.con_stance_desc
        opponent_desc = session.pro_stance_desc

    system = build_opponent_prompt(
        debate_topic_title=session.debate_topic_title,
        stance_description=stance_desc,
        opponent_stance_description=opponent_desc,
        topic_summary=session.topic_summary,
        round_number=session.round_number,
        max_rounds=session.max_rounds,
        is_opening=is_opening,
    )

    # Build message history for context (last 6 messages max to stay within token limits)
    history = []
    for msg in session.messages[-6:]:
        role = "user" if msg.role == "user" else "assistant"
        history.append({"role": role, "content": msg.content})

    async for chunk in llm.stream(history, system):
        yield chunk


async def evaluate_debate(session: DebateSessionInMemory) -> dict:
    """Evaluate the full debate using LLM."""
    # Build conversation text
    lines = []
    for msg in session.messages:
        label = "学生（正方）" if msg.role == "user" else "AI（反方）"
        lines.append(f"【{label}】{msg.content}")
    conversation = "\n".join(lines)

    # Get stance descriptions
    user_stance_desc = session.pro_stance_desc if session.user_stance == Stance.PRO else session.con_stance_desc
    ai_stance_desc = session.con_stance_desc if session.ai_stance == Stance.CON else session.pro_stance_desc

    prompt = build_evaluation_prompt(
        topic_title=session.debate_topic_title,
        user_stance=user_stance_desc,
        opponent_stance=ai_stance_desc,
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

    # Calculate total score
    scores = DebateScores(**data["scores"])

    return {
        "scores": scores.model_dump(),
        "total_score": scores.total,
        "strengths": data["strengths"],
        "improvements": data["improvements"],
        "summary": data["summary"],
    }
