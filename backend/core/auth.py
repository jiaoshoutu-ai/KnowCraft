"""
JWT authentication dependency for FastAPI.
"""
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from database import get_db
from models.db_models import User, UserRole, DebateSession

security = HTTPBearer()


async def _delete_guest_user(db: AsyncSession, user: User) -> None:
    """Delete a guest user and all of its debate data."""
    result = await db.execute(
        select(User)
        .options(selectinload(User.debate_sessions).selectinload(DebateSession.messages))
        .options(selectinload(User.debate_sessions).selectinload(DebateSession.evaluation))
        .where(User.id == user.id)
    )
    guest_user = result.scalar_one_or_none()
    if guest_user is not None:
        await db.delete(guest_user)


async def _cleanup_expired_guest_users(db: AsyncSession) -> None:
    """Remove guest users that have been inactive for more than one day."""
    expired_before = datetime.utcnow() - timedelta(days=1)
    result = await db.execute(
        select(User)
        .options(selectinload(User.debate_sessions).selectinload(DebateSession.messages))
        .options(selectinload(User.debate_sessions).selectinload(DebateSession.evaluation))
        .where(User.role == UserRole.GUEST)
        .where(User.last_active_at < expired_before)
    )
    for guest_user in result.scalars().all():
        await db.delete(guest_user)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Extract and validate JWT token, return current user.
    Usage: user: User = Depends(get_current_user)
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token 无效"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 无效或已过期"
        )

    await _cleanup_expired_guest_users(db)

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )

    if user.role == UserRole.GUEST:
        expired_before = datetime.utcnow() - timedelta(days=1)
        if user.last_active_at < expired_before:
            await _delete_guest_user(db, user)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="游客账号已过期",
            )

    user.last_active_at = datetime.utcnow()
    await db.commit()

    return user
