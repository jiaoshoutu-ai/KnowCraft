from typing import Dict, List, Optional
from pydantic import BaseModel


class DebateMessage(BaseModel):
    role: str  # "user" or perspective id
    speaker: str
    avatar: str = ""
    content: str


class DebateScores(BaseModel):
    logic: int
    evidence: int
    expression: int
    rebuttal: int
    perspective: int

    @property
    def total(self) -> int:
        return self.logic + self.evidence + self.expression + self.rebuttal + self.perspective


class Evaluation(BaseModel):
    scores: DebateScores
    total_score: int
    strengths: List[str]
    improvements: List[str]
    summary: str


class DebateSession(BaseModel):
    session_id: str
    topic_id: str
    perspective_id: str  # AI opponent's perspective
    round_number: int = 0
    max_rounds: int = 5
    messages: List[DebateMessage] = []
    phase: str = "init"  # init | debating | evaluating | done
    evaluation: Optional[Evaluation] = None
