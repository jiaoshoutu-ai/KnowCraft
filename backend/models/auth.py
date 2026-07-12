"""
Pydantic models for authentication.
"""
from pydantic import BaseModel, EmailStr


class SendCodeRequest(BaseModel):
    """Request to send verification code."""
    email: EmailStr


class VerifyRequest(BaseModel):
    """Request to verify code and login."""
    email: EmailStr
    code: str


class UserResponse(BaseModel):
    """User info returned after login."""
    id: str
    username: str
    email: str
    avatar: str
    role: str
    debate_count: int = 0
    average_score: float = 0.0


class AuthResponse(BaseModel):
    """Response after successful login."""
    token: str
    user: UserResponse
