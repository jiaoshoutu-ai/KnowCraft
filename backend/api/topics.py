"""
Topics API endpoints.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.db_models import Topic, Video, DebateTopic
from models.topic import (
    Topic as TopicResponse,
    TopicListItem,
    TopicCreate,
    TopicUpdate,
    TranscriptGenerateRequest,
    TranscriptGenerateResponse,
    GeneratedDebateTopic,
)
from core.content_generation import generate_debate_topics_from_transcript

router = APIRouter()


@router.get("/topics", response_model=List[TopicListItem])
async def list_topics(
    include_unpublished: bool = Query(False, description="Include unpublished topics (admin)"),
    db: AsyncSession = Depends(get_db)
):
    """List topics. By default only published. Admin can include unpublished."""
    query = select(Topic).options(selectinload(Topic.debate_topics))
    if not include_unpublished:
        query = query.where(Topic.is_published == True)
    query = query.order_by(Topic.created_at.desc())

    result = await db.execute(query)
    topics = result.scalars().all()

    return [
        TopicListItem(
            id=t.id,
            title=t.title,
            source=t.source,
            tags=t.tags,
            is_published=t.is_published,
            view_count=t.view_count,
            debate_count=t.debate_count,
            debate_topic_count=len(t.debate_topics)
        )
        for t in topics
    ]


@router.get("/topics/{topic_id}", response_model=TopicResponse)
async def get_topic(topic_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific topic with video and debate topics."""
    result = await db.execute(
        select(Topic)
        .options(
            selectinload(Topic.video),
            selectinload(Topic.debate_topics)
        )
        .where(Topic.id == topic_id)
    )
    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Increment view count
    topic.view_count += 1
    await db.commit()

    return TopicResponse.model_validate(topic)


@router.post("/topics", response_model=TopicResponse, status_code=201)
async def create_topic(data: TopicCreate, db: AsyncSession = Depends(get_db)):
    """Create a new topic (admin)."""
    topic_id = str(uuid.uuid4())[:8]
    now = datetime.now()

    # Create topic
    topic = Topic(
        id=topic_id,
        title=data.title,
        source=data.source,
        summary=data.summary,
        tags=data.tags,
        is_published=data.is_published,
        created_at=now,
        updated_at=now,
    )
    db.add(topic)
    await db.flush()

    # Create video
    video = Video(
        topic_id=topic_id,
        url=data.video.url,
        duration=data.video.duration,
        cover=data.video.cover,
        transcript=data.video.transcript,
    )
    db.add(video)

    # Create debate topics
    for dt in data.debate_topics:
        debate_topic = DebateTopic(
            id=f"dt-{uuid.uuid4().hex[:6]}",
            topic_id=topic_id,
            title=dt.title,
            pro_stance=dt.pro_stance,
            con_stance=dt.con_stance,
            participant_count=0,
        )
        db.add(debate_topic)

    await db.commit()

    # Return full topic
    result = await db.execute(
        select(Topic)
        .options(selectinload(Topic.video), selectinload(Topic.debate_topics))
        .where(Topic.id == topic_id)
    )
    return TopicResponse.model_validate(result.scalar_one())


@router.put("/topics/{topic_id}", response_model=TopicResponse)
async def update_topic(topic_id: str, data: TopicUpdate, db: AsyncSession = Depends(get_db)):
    """Update a topic (admin)."""
    result = await db.execute(
        select(Topic)
        .options(selectinload(Topic.video), selectinload(Topic.debate_topics))
        .where(Topic.id == topic_id)
    )
    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Update fields
    if data.title is not None:
        topic.title = data.title
    if data.source is not None:
        topic.source = data.source
    if data.summary is not None:
        topic.summary = data.summary
    if data.tags is not None:
        topic.tags = data.tags
    if data.is_published is not None:
        topic.is_published = data.is_published

    topic.updated_at = datetime.now()
    await db.commit()

    # Reload and return
    result = await db.execute(
        select(Topic)
        .options(selectinload(Topic.video), selectinload(Topic.debate_topics))
        .where(Topic.id == topic_id)
    )
    return TopicResponse.model_validate(result.scalar_one())


@router.delete("/topics/{topic_id}")
async def delete_topic(topic_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a topic (admin)."""
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    await db.delete(topic)
    await db.commit()

    return {"success": True, "message": "Topic deleted"}


@router.post("/topics/generate", response_model=TranscriptGenerateResponse)
async def generate_topics_from_transcript(request: TranscriptGenerateRequest):
    """Generate debate topics from video transcript using AI."""
    try:
        topics = await generate_debate_topics_from_transcript(
            transcript=request.transcript,
            num_topics=request.num_topics
        )

        return TranscriptGenerateResponse(
            debate_topics=[
                GeneratedDebateTopic(**topic)
                for topic in topics
            ]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate topics: {str(e)}")


async def get_topic_by_id(topic_id: str, db: AsyncSession) -> Topic:
    """Internal helper — used by debate module."""
    result = await db.execute(
        select(Topic)
        .options(
            selectinload(Topic.video),
            selectinload(Topic.debate_topics)
        )
        .where(Topic.id == topic_id)
    )
    topic = result.scalar_one_or_none()

    if not topic:
        raise ValueError(f"Topic not found: {topic_id}")

    return topic
