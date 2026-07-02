"""
Pydantic models for debate-related data.
"""
from datetime import datetime
from typing import List, Optional
from enum import Enum

from pydantic import BaseModel, Field


class Stance(str, Enum):
    """Debate stance: pro or con."""
    PRO = "pro"
    CON = "con"


class Difficulty(str, Enum):
    """Debate difficulty levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class DebatePhase(str, Enum):
    """Debate session phases."""
    INIT = "init"
    DEBATING = "debating"
    EVALUATING = "evaluating"
    DONE = "done"


class DebateMessageBase(BaseModel):
    """Debate message base model."""
    role: str  # "user" or "ai"
    stance: Stance
    content: str


class DebateMessageCreate(DebateMessageBase):
    """Model for creating debate messages."""
    pass


class DebateMessage(DebateMessageBase):
    """Debate message for API responses."""
    id: int
    session_id: str
    timestamp: datetime

    class Config:
        from_attributes = True


class DebateScores(BaseModel):
    """Debate evaluation scores (each 0-10)."""
    logic: int = Field(ge=0, le=10, description="Logical reasoning")
    evidence: int = Field(ge=0, le=10, description="Use of evidence")
    expression: int = Field(ge=0, le=10, description="Expression clarity")
    rebuttal: int = Field(ge=0, le=10, description="Rebuttal skills")
    critical_thinking: int = Field(ge=0, le=10, description="Critical thinking")

    @property
    def total(self) -> int:
        """Calculate total score."""
        return self.logic + self.evidence + self.expression + self.rebuttal + self.critical_thinking


class EvaluationBase(BaseModel):
    """Evaluation base model."""
    scores: DebateScores
    strengths: List[str]
    improvements: List[str]
    summary: str


class EvaluationCreate(EvaluationBase):
    """Model for creating evaluations."""
    pass


class Evaluation(EvaluationBase):
    """Evaluation for API responses."""
    id: int
    session_id: str

    class Config:
        from_attributes = True


class DebateSessionBase(BaseModel):
    """Debate session base model."""
    topic_id: str
    debate_topic_id: str
    user_stance: Stance
    ai_stance: Stance
    difficulty: Difficulty = Difficulty.INTERMEDIATE


class DebateSessionCreate(DebateSessionBase):
    """Model for creating debate sessions."""
    pass


class DebateSession(DebateSessionBase):
    """Debate session for API responses."""
    session_id: str
    user_id: str
    round_number: int = 0
    max_rounds: int = 5
    phase: DebatePhase = DebatePhase.INIT
    messages: List[DebateMessage] = []
    evaluation: Optional[Evaluation] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DebateSessionListItem(BaseModel):
    """Lightweight debate session for list views."""
    session_id: str
    topic_id: str
    debate_topic_id: str
    user_stance: Stance
    ai_stance: Stance
    difficulty: Difficulty
    phase: DebatePhase
    round_number: int
    max_rounds: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
