"""
Email sending service.
Uses SMTP when configured; falls back to console logging (mock mode) for development.
"""
import smtplib
from email.mime.text import MIMEText

from config import settings


def send_verification_email(to_email: str, code: str) -> bool:
    """
    Send a verification code email.
    Returns True on success, False on failure.
    In mock mode (SMTP not configured), prints code to console and returns True.
    """
    if not settings.smtp_host or not settings.smtp_user:
        # Mock mode: print to console
        print(f"\n{'='*50}")
        print(f"[Mock Email] To: {to_email}")
        print(f"[Mock Email] Verification Code: {code}")
        print(f"{'='*50}\n")
        return True

    subject = "KnowCraft 登录验证码"
    html_body = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
                max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #6C5CE7; margin-bottom: 8px;">KnowCraft 思辨力训练平台</h2>
        <p style="color: #636E72; margin-bottom: 24px;">你的登录验证码：</p>
        <div style="background: #F0EEFF; border-radius: 12px; padding: 24px; text-align: center;
                    margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px;
                         color: #6C5CE7;">{code}</span>
        </div>
        <p style="color: #B2BEC3; font-size: 13px;">
            验证码 5 分钟内有效，请勿泄露给他人。
        </p>
    </div>
    """

    msg = MIMEText(html_body, "html", "utf-8")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = to_email

    try:
        if settings.smtp_port == 465:
            server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port)
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
            server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(msg["From"], [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"[Email Error] Failed to send to {to_email}: {e}")
        return False
