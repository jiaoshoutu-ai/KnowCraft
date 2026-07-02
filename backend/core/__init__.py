# Core module initialization
from config import settings
from .llm_adapter import LLMAdapter


def get_llm_adapter() -> LLMAdapter:
    """Factory function to get the configured LLM adapter."""
    provider = settings.llm_provider.lower()

    if provider == "deepseek":
        if not settings.deepseek_api_key or settings.deepseek_api_key == "your_api_key_here":
            # Fall back to mock if no DeepSeek key
            from .mock_adapter import MockLLMAdapter
            return MockLLMAdapter()
        from .deepseek_adapter import DeepSeekAdapter
        return DeepSeekAdapter()

    elif provider == "qwen":
        if not settings.dashscope_api_key or settings.dashscope_api_key == "your_api_key_here":
            # Fall back to mock if no Qwen key
            from .mock_adapter import MockLLMAdapter
            return MockLLMAdapter()
        from .qwen_adapter import QwenAdapter
        return QwenAdapter()

    else:
        # Default to mock
        from .mock_adapter import MockLLMAdapter
        return MockLLMAdapter()
