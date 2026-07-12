"""
SQLAlchemy ORM models for KnowCraft.
"""
import enum
from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


# Enumerations
class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"


class Stance(str, enum.Enum):
    PRO = "pro"
    CON = "con"


class DebatePhase(str, enum.Enum):
    INIT = "init"
    DEBATING = "debating"
    EVALUATING = "evaluating"
    DONE = "done"


class Difficulty(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


# Models
class User(Base):
    """User model for students and admins."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    username: Mapped[str] = mapped_column(String(100))
    email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True, unique=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    avatar: Mapped[str] = mapped_column(String(500), default="")
    role: Mapped[UserRole] = mapped_column(default=UserRole.STUDENT)

    # Student stats
    debate_count: Mapped[int] = mapped_column(Integer, default=0)
    average_score: Mapped[float] = mapped_column(Float, default=0.0)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_active_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    debate_sessions: Mapped[List["DebateSession"]] = relationship(back_populates="user")


class Video(Base):
    """Video information for topics."""
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("topics.id"))

    url: Mapped[str] = mapped_column(String(500))
    duration: Mapped[str] = mapped_column(String(50), default="")
    cover: Mapped[str] = mapped_column(String(500), default="")
    transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    topic: Mapped["Topic"] = relationship(back_populates="video")


class DebateTopic(Base):
    """Debate topic with pro/con stances."""
    __tablename__ = "debate_topics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("topics.id"))

    title: Mapped[str] = mapped_column(String(500))
    pro_stance: Mapped[str] = mapped_column(Text)
    con_stance: Mapped[str] = mapped_column(Text)
    participant_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    topic: Mapped["Topic"] = relationship(back_populates="debate_topics")
    debate_sessions: Mapped[List["DebateSession"]] = relationship(back_populates="debate_topic")


class Topic(Base):
    """Main topic model."""
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    source: Mapped[str] = mapped_column(String(100))
    summary: Mapped[str] = mapped_column(Text)
    tags: Mapped[List[str]] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    debate_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    video: Mapped[Video] = relationship(back_populates="topic", cascade="all, delete-orphan", uselist=False)
    debate_topics: Mapped[List[DebateTopic]] = relationship(back_populates="topic", cascade="all, delete-orphan")
    debate_sessions: Mapped[List["DebateSession"]] = relationship(back_populates="topic")


class DebateMessage(Base):
    """Individual debate message."""
    __tablename__ = "debate_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("debate_sessions.session_id"))

    role: Mapped[str] = mapped_column(String(20))  # "user" or "ai"
    stance: Mapped[Stance] = mapped_column()
    content: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    session: Mapped["DebateSession"] = relationship(back_populates="messages")


class Evaluation(Base):
    """Debate evaluation with scores and feedback."""
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("debate_sessions.session_id"), unique=True)

    # Scores (0-10 each)
    logic: Mapped[int] = mapped_column(Integer)
    evidence: Mapped[int] = mapped_column(Integer)
    expression: Mapped[int] = mapped_column(Integer)
    rebuttal: Mapped[int] = mapped_column(Integer)
    critical_thinking: Mapped[int] = mapped_column(Integer)

    # Feedback
    strengths: Mapped[List[str]] = mapped_column(JSON)
    improvements: Mapped[List[str]] = mapped_column(JSON)
    summary: Mapped[str] = mapped_column(Text)

    # Relationships
    session: Mapped["DebateSession"] = relationship(back_populates="evaluation")


class DebateSession(Base):
    """Debate session tracking."""
    __tablename__ = "debate_sessions"

    session_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("topics.id"))
    debate_topic_id: Mapped[str] = mapped_column(String(36), ForeignKey("debate_topics.id"))

    user_stance: Mapped[Stance] = mapped_column()
    ai_stance: Mapped[Stance] = mapped_column()

    round_number: Mapped[int] = mapped_column(Integer, default=0)
    max_rounds: Mapped[int] = mapped_column(Integer, default=5)
    difficulty: Mapped[Difficulty] = mapped_column(default=Difficulty.INTERMEDIATE)

    phase: Mapped[DebatePhase] = mapped_column(default=DebatePhase.INIT)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped[User] = relationship(back_populates="debate_sessions")
    topic: Mapped[Topic] = relationship(back_populates="debate_sessions")
    debate_topic: Mapped[DebateTopic] = relationship(back_populates="debate_sessions")
    messages: Mapped[List[DebateMessage]] = relationship(back_populates="session", cascade="all, delete-orphan")
    evaluation: Mapped[Optional[Evaluation]] = relationship(back_populates="session", cascade="all, delete-orphan", uselist=False)
