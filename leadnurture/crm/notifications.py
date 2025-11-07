from abc import ABC, abstractmethod
from typing import Iterable
import logging
from dotenv import load_dotenv
from django.core.mail import send_mail

load_dotenv()

logger = logging.getLogger(__name__)


class Notifier(ABC):
    """Abstract notifier interface for sending messages to leads."""

    @abstractmethod
    def notify(self, emails: Iterable[str], subject: str, message: str) -> None:
        pass


class EmailNotifier(Notifier):
    """Concrete notifier that sends emails via Django's email backend."""

    def __init__(self, from_email: str = "noreply@example.com"):
        self.from_email = from_email

    def notify(self, emails: Iterable[str], subject: str, message: str) -> None:
        recipient_list = [e for e in emails if e]
        if not recipient_list:
            logger.debug("No recipient emails provided, skipping email send")
            return
        # send_mail will use Django settings for EMAIL_BACKEND and related settings
        try:
            send_mail(subject, message, self.from_email, recipient_list, fail_silently=False)
            logger.info("Sent email to %d recipients", len(recipient_list))
        except Exception:
            logger.exception("Failed to send email to recipients")


class WhatsAppNotifier(Notifier):
    """Stub notifier for WhatsApp. Replace with real provider integration as needed."""

    def notify(self, emails: Iterable[str], subject: str, message: str) -> None:
        # In a real implementation we'd map lead contact numbers and call a WhatsApp API
        logger.info("WhatsApp notify called (stub). Subject: %s, recipients: %s", subject, list(emails))
