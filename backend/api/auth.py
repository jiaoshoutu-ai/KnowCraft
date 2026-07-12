"""
Authentication API endpoints: send-code and verify (email code login).
"""
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models.auth import (
    SendCodeRequest,
    VerifyRequest,
    AuthResponse,
    UserResponse,
)
from models.db_models import User
from core.verification import store_code, verify_code
from core.email import send_verification_email

router = APIRouter()


def _create_token(user: User) -> str:
    """Create a JWT token for the given user."""
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": user.id,
        "email": user.email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def _user_to_response(user: User) -> UserResponse:
    """Convert User ORM object to UserResponse."""
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email or "",
        avatar=user.avatar,
        role=user.role.value,
        debate_count=user.debate_count,
        average_score=user.average_score,
    )


@router.post("/auth/send-code")
async def send_code(req: SendCodeRequest):
    """Send a 6-digit verification code to the given email."""
    try:
        code = store_code(req.email)
    except ValueError as e:
        raise HTTPException(status_code=429, detail=str(e))

    success = send_verification_email(req.email, code)
    if not success:
        raise HTTPException(status_code=500, detail="验证码发送失败，请稍后重试")

    return {"message": "验证码已发送"}


@router.post("/auth/verify", response_model=AuthResponse)
async def verify_login(req: VerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify the code and return JWT token + user info."""
    if not verify_code(req.email, req.code):
        raise HTTPException(status_code=401, detail="验证码无效或已过期")

    # Find or create user by email
    result = await db.execute(
        select(User).where(User.email == req.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        # Auto-register: create user with email as username
        user = User(
            id=str(uuid.uuid4())[:8],
            username=req.email.split("@")[0],
            email=req.email,
            email_verified=True,
            avatar="",
            created_at=datetime.utcnow(),
            last_active_at=datetime.utcnow(),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update last active
        user.last_active_at = datetime.utcnow()
        user.email_verified = True
        await db.commit()
        await db.refresh(user)

    token = _create_token(user)
    return AuthResponse(
        token=token,
        user=_user_to_response(user),
    )
