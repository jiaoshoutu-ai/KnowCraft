import json
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException

from config import settings
from models.topic import Topic, TopicListItem

router = APIRouter()

_topic_cache: dict = {}


def _load_topics() -> dict:
    """Load all topics from JSON files."""
    if _topic_cache:
        return _topic_cache
    topics_dir = Path(settings.topics_dir)
    if not topics_dir.exists():
        return {}
    for f in topics_dir.glob("*.json"):
        with open(f, "r", encoding="utf-8") as fh:
            data = json.load(fh)
            topic = Topic(**data)
            _topic_cache[topic.id] = topic
    return _topic_cache


@router.get("/topics", response_model=List[TopicListItem])
async def list_topics():
    topics = _load_topics()
    return [
        TopicListItem(
            id=t.id,
            title=t.title,
            source=t.source,
            cover=t.cover,
            perspective_count=t.perspective_count,
            tags=t.tags,
        )
        for t in topics.values()
    ]


@router.get("/topics/{topic_id}", response_model=Topic)
async def get_topic(topic_id: str):
    topics = _load_topics()
    topic = topics.get(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


def get_topic_by_id(topic_id: str) -> Topic:
    """Internal helper — used by debate module."""
    topics = _load_topics()
    topic = topics.get(topic_id)
    if not topic:
        raise ValueError(f"Topic not found: {topic_id}")
    return topic
