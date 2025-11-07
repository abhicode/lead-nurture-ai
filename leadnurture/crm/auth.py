import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from ninja.security import HttpBearer
from ninja.errors import HttpError
from asgiref.sync import sync_to_async

class JWTAuth(HttpBearer):
    """HTTP Bearer auth that validates JWT tokens and returns a Django user."""

    async def authenticate(self, request, token: str):
        if not token:
            raise HttpError(401, "Authorization token required")
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise HttpError(401, "Token expired")
        except jwt.PyJWTError:
            raise HttpError(401, "Invalid token")

        user_id = payload.get("user_id")
        if not user_id:
            raise HttpError(401, "Invalid token payload")

        User = get_user_model()
        try:
            user = await sync_to_async(User.objects.get)(pk=user_id)
        except User.DoesNotExist:
            raise HttpError(401, "User not found")

        return user


def create_jwt_for_user(user, hours_valid: int = 1) -> str:
    """Create a signed JWT for the given user."""
    now = datetime.utcnow()
    payload = {
        "user_id": user.id,
        "iat": now,
        "exp": now + timedelta(hours=hours_valid),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    # pyjwt returns str in v2+, but in some installs it may return bytes
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token
