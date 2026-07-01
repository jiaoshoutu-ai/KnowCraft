from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Optional


class LLMAdapter(ABC):
    """Unified LLM interface — swap providers without changing business logic."""

    @abstractmethod
    async def chat(
        self,
        messages: List[dict],
        system: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """Return full response text."""

    @abstractmethod
    async def stream(
        self,
        messages: List[dict],
        system: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> AsyncIterator[str]:
        """Yield response chunks one token at a time."""
