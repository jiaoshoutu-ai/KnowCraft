"""DeepSeek API adapter - OpenAI-compatible interface."""
import asyncio
import json
from typing import AsyncIterator, List, Optional

import httpx

from config import settings
from .llm_adapter import LLMAdapter


class DeepSeekAdapter(LLMAdapter):
    """DeepSeek adapter using OpenAI-compatible API."""

    def __init__(self):
        self.api_key = settings.deepseek_api_key
        self.base_url = settings.deepseek_base_url.rstrip("/")
        self.model = settings.deepseek_model
        self.proxy = settings.https_proxy if settings.https_proxy else None

        if not self.api_key:
            raise ValueError("DeepSeek API key not configured")

    def _build_messages(self, messages: List[dict], system: str) -> List[dict]:
        return [{"role": "system", "content": system}] + messages

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def chat(
        self,
        messages: List[dict],
        system: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """Return full response text."""
        msgs = self._build_messages(messages, system)
        payload = {
            "model": self.model,
            "messages": msgs,
            "max_tokens": max_tokens or settings.llm_max_tokens,
            "temperature": temperature or settings.llm_temperature,
            "stream": False,
        }

        async with httpx.AsyncClient(timeout=60.0, proxy=self.proxy) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        return data["choices"][0]["message"]["content"]

    async def stream(
        self,
        messages: List[dict],
        system: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> AsyncIterator[str]:
        """Yield response chunks one token at a time."""
        msgs = self._build_messages(messages, system)
        payload = {
            "model": self.model,
            "messages": msgs,
            "max_tokens": max_tokens or settings.llm_max_tokens,
            "temperature": temperature or settings.llm_temperature,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=60.0, proxy=self.proxy) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data_str = line[6:].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data["choices"][0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
