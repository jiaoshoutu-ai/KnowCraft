"""
User-related API endpoints: debate history, profile details.
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.db_models import DebateSession, DebateTopic, Evaluation, DebatePhase
from core.auth import get_current_user
from models.db_models import User, UserRole

router = APIRouter(prefix="/users", tags=["users"])


class HistoryItem(BaseModel):
    """Single debate session in history list."""
    session_id: str
    topic_title: str
    user_stance: str
    difficulty: str
    total_score: Optional[int] = None
    completed_at: Optional[datetime] = None


class EvaluationResponse(BaseModel):
    """Evaluation details for a debate session."""
    logic: int
    evidence: int
    expression: int
    rebuttal: int
    critical_thinking: int
    strengths: list
    improvements: list
    summary: str


class HistoryDetailResponse(BaseModel):
    """Full debate detail including evaluation."""
    session_id: str
    topic_id: str
    debate_topic_id: str
    topic_title: str
    user_stance: str
    ai_stance: str
    difficulty: str
    max_rounds: int
    round_number: int
    completed_at: Optional[datetime] = None
    evaluation: Optional[EvaluationResponse] = None


class AdminUserResponse(BaseModel):
    """User info for administrator user management."""
    id: str
    username: str
    email: str
    avatar: str
    role: str
    debate_count: int
    average_score: float
    streak_days: int
    created_at: datetime
    last_active_at: datetime


class UpdateUserRoleRequest(BaseModel):
    """Request to update a user's permission role."""
    role: str


def require_admin(user: User) -> None:
    """Raise 403 when current user is not an administrator."""
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限",
        )


def to_admin_user_response(user: User) -> AdminUserResponse:
    """Convert User ORM object to administrator response."""
    return AdminUserResponse(
        id=user.id,
        username=user.username,
        email=user.email or "",
        avatar=user.avatar or "",
        role=user.role.value,
        debate_count=user.debate_count or 0,
        average_score=user.average_score or 0.0,
        streak_days=user.streak_days or 0,
        created_at=user.created_at,
        last_active_at=user.last_active_at,
    )


@router.get("/admin/users", response_model=list[AdminUserResponse])
async def list_admin_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all site users for administrators."""
    require_admin(current_user)

    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    return [to_admin_user_response(user) for user in users]


@router.put("/admin/users/{user_id}/role", response_model=AdminUserResponse)
async def update_admin_user_role(
    user_id: str,
    req: UpdateUserRoleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a user's administrator permission role."""
    require_admin(current_user)

    if req.role not in {UserRole.STUDENT.value, UserRole.ADMIN.value}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的用户角色",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    if target_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )

    target_user.role = UserRole(req.role)
    await db.commit()
    await db.refresh(target_user)
    return to_admin_user_response(target_user)


@router.get("/me/history", response_model=list[HistoryItem])
async def get_my_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return current user's completed debate sessions."""
    result = await db.execute(
        select(DebateSession)
        .options(
            selectinload(DebateSession.debate_topic),
            selectinload(DebateSession.evaluation),
        )
        .where(DebateSession.user_id == user.id)
        .where(DebateSession.phase == DebatePhase.DONE)
        .order_by(DebateSession.completed_at.desc().nullslast())
    )
    sessions = result.scalars().all()

    items = []
    for s in sessions:
        total = None
        if s.evaluation:
            total = (
                s.evaluation.logic
                + s.evaluation.evidence
                + s.evaluation.expression
                + s.evaluation.rebuttal
                + s.evaluation.critical_thinking
            )
        items.append(HistoryItem(
            session_id=s.session_id,
            topic_title=s.debate_topic.title if s.debate_topic else "",
            user_stance=s.user_stance.value,
            difficulty=s.difficulty.value,
            total_score=total,
            completed_at=s.completed_at,
        ))
    return items


@router.get("/me/history/{session_id}", response_model=HistoryDetailResponse)
async def get_my_history_detail(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return full detail of one completed debate session."""
    result = await db.execute(
        select(DebateSession)
        .options(
            selectinload(DebateSession.debate_topic),
            selectinload(DebateSession.evaluation),
        )
        .where(DebateSession.session_id == session_id)
        .where(DebateSession.user_id == user.id)
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="辩论记录不存在",
        )

    eval_resp = None
    if session.evaluation:
        e = session.evaluation
        eval_resp = EvaluationResponse(
            logic=e.logic,
            evidence=e.evidence,
            expression=e.expression,
            rebuttal=e.rebuttal,
            critical_thinking=e.critical_thinking,
            strengths=e.strengths or [],
            improvements=e.improvements or [],
            summary=e.summary or "",
        )

    return HistoryDetailResponse(
        session_id=session.session_id,
        topic_id=session.topic_id,
        debate_topic_id=session.debate_topic_id,
        topic_title=session.debate_topic.title if session.debate_topic else "",
        user_stance=session.user_stance.value,
        ai_stance=session.ai_stance.value,
        difficulty=session.difficulty.value,
        max_rounds=session.max_rounds,
        round_number=session.round_number,
        completed_at=session.completed_at,
        evaluation=eval_resp,
    )
