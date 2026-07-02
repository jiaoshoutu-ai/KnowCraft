"""
Pydantic models for topic-related data.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class VideoBase(BaseModel):
    """Video base model."""
    url: str
    duration: str = ""
    cover: str = ""
    transcript: Optional[str] = None


class VideoCreate(VideoBase):
    """Model for creating videos."""
    pass


class Video(VideoBase):
    """Video model for API responses."""
    id: int
    topic_id: str

    class Config:
        from_attributes = True


class DebateTopicBase(BaseModel):
    """Debate topic base model."""
    title: str
    pro_stance: str
    con_stance: str


class DebateTopicCreate(DebateTopicBase):
    """Model for creating debate topics."""
    pass


class DebateTopic(DebateTopicBase):
    """Debate topic model for API responses."""
    id: str
    topic_id: str
    participant_count: int = 0

    class Config:
        from_attributes = True


class TopicBase(BaseModel):
    """Topic base model."""
    title: str
    source: str
    summary: str
    tags: List[str] = []


class TopicCreate(TopicBase):
    """Model for creating topics."""
    video: VideoCreate
    debate_topics: List[DebateTopicCreate]
    is_published: bool = False


class TopicUpdate(BaseModel):
    """Model for updating topics."""
    title: Optional[str] = None
    source: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None


class Topic(TopicBase):
    """Topic model for API responses."""
    id: str
    video: Video
    debate_topics: List[DebateTopic]
    created_at: datetime
    updated_at: datetime
    is_published: bool
    view_count: int
    debate_count: int

    class Config:
        from_attributes = True


class TopicListItem(BaseModel):
    """Lightweight topic for list views."""
    id: str
    title: str
    source: str
    tags: List[str]
    is_published: bool
    view_count: int
    debate_count: int
    debate_topic_count: int  # Number of debate topics

    class Config:
        from_attributes = True


class TranscriptGenerateRequest(BaseModel):
    """Request model for generating debate topics from transcript."""
    transcript: str
    num_topics: int = 3


class GeneratedDebateTopic(BaseModel):
    """Model for a generated debate topic."""
    title: str
    pro_stance: str
    con_stance: str


class TranscriptGenerateResponse(BaseModel):
    """Response model for generated debate topics."""
    debate_topics: List[GeneratedDebateTopic]
