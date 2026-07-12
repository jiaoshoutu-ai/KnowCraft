"""
In-memory verification code storage.
Codes expire after 5 minutes; same email cannot resend within 60 seconds.
"""
import random
import time

EXPIRE_SECONDS = 300  # 5 minutes
RESEND_COOLDOWN = 60  # 60 seconds

_codes: dict[str, dict] = {}  # email -> {"code": str, "created_at": float}


def store_code(email: str) -> str:
    """Generate and store a 6-digit verification code for the given email."""
    now = time.time()

    # Check cooldown
    existing = _codes.get(email)
    if existing and (now - existing["created_at"]) < RESEND_COOLDOWN:
        remaining = int(RESEND_COOLDOWN - (now - existing["created_at"]))
        raise ValueError(f"请等待 {remaining} 秒后再重新发送验证码")

    code = f"{random.randint(0, 999999):06d}"
    _codes[email] = {"code": code, "created_at": now}
    return code


def verify_code(email: str, code: str) -> bool:
    """Verify the code for the given email. Returns True if valid."""
    entry = _codes.get(email)
    if not entry:
        return False

    # Check expiration
    if (time.time() - entry["created_at"]) > EXPIRE_SECONDS:
        _codes.pop(email, None)
        return False

    if entry["code"] != code:
        return False

    # Code verified, remove it
    _codes.pop(email, None)
    return True
