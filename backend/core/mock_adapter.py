import asyncio
from typing import AsyncIterator, List, Optional

from .llm_adapter import LLMAdapter


class MockLLMAdapter(LLMAdapter):
    """Mock LLM adapter for testing without API keys."""

    async def chat(
        self,
        messages: List[dict],
        system: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """Return a mock response."""
        await asyncio.sleep(0.5)  # Simulate API latency

        # Check if this is an evaluation request
        if "评委" in system or "evaluation" in system.lower():
            # Return mock evaluation JSON
            return '''{
  "scores": {
    "logic": 7,
    "evidence": 6,
    "expression": 8,
    "rebuttal": 7,
    "perspective": 6
  },
  "total_score": 34,
  "strengths": ["论点清晰，表达有力", "能够针对对方观点进行反驳"],
  "improvements": ["可以引用更多具体数据", "尝试从更多角度思考问题"],
  "summary": "整体表现良好，逻辑清晰，建议多积累相关知识和数据来支持论点。"
}'''

        return "这是一个模拟的回复，用于测试辩论流程。"

    async def stream(
        self,
        messages: List[dict],
        system: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> AsyncIterator[str]:
        """Stream a mock response word by word."""
        # Mock opening statement
        if not messages:
            text = "作为家长代表，我认为短视频平台的算法推荐机制对未成年人造成了严重危害。平台利用精准推送，让孩子们沉迷其中无法自拔，导致学习成绩下降、注意力分散、与家人交流减少。平台应该承担主要责任，因为他们明知这些算法会对青少年造成伤害，却为了商业利益而继续使用。"
        else:
            # Mock rebuttal
            text = "我不同意你的观点。虽然家长确实有监管责任，但平台的算法是专门设计来让人上瘾的。孩子们根本无法抵抗这种精心设计的推荐系统。家长不可能24小时监控孩子，而平台却可以轻易地关闭这些有害的推荐功能。技术中立不能成为逃避责任的借口。"

        # Stream word by word
        words = text.split()
        for word in words:
            yield word
            await asyncio.sleep(0.05)
