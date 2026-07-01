import asyncio
from typing import AsyncIterator, List, Optional

import dashscope
from dashscope import Generation

from config import settings
from .llm_adapter import LLMAdapter


class QwenAdapter(LLMAdapter):
    """Qwen (DashScope) adapter."""

    def __init__(self):
        dashscope.api_key = settings.dashscope_api_key

    def _build_messages(self, messages: List[dict], system: str) -> List[dict]:
        return [{"role": "system", "content": system}] + messages

    async def chat(
        self,
        messages: List[dict],
        system: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        msgs = self._build_messages(messages, system)
        response = Generation.call(
            model=settings.llm_model,
            messages=msgs,
            result_format="message",
            max_tokens=max_tokens or settings.llm_max_tokens,
            temperature=temperature or settings.llm_temperature,
        )
        if response.status_code != 200:
            raise RuntimeError(f"Qwen API error: {response.code} - {response.message}")
        return response.output.choices[0].message.content

    async def stream(
        self,
        messages: List[dict],
        system: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> AsyncIterator[str]:
        msgs = self._build_messages(messages, system)
        responses = Generation.call(
            model=settings.llm_model,
            messages=msgs,
            result_format="message",
            max_tokens=max_tokens or settings.llm_max_tokens,
            temperature=temperature or settings.llm_temperature,
            stream=True,
            incremental_output=True,
        )

        # Run blocking iteration in a thread to keep async
        queue: asyncio.Queue = asyncio.Queue()

        def _iterate():
            try:
                for chunk in responses:
                    if chunk.status_code != 200:
                        queue.put_nowait(
                            RuntimeError(f"Qwen API error: {chunk.code} - {chunk.message}")
                        )
                        return
                    content = chunk.output.choices[0].message.get("content", "")
                    if content:
                        queue.put_nowait(content)
            finally:
                queue.put_nowait(None)  # sentinel

        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, _iterate)

        while True:
            item = await queue.get()
            if item is None:
                break
            if isinstance(item, Exception):
                raise item
            yield item
