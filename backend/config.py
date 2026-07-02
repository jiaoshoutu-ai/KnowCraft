import os
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: List[str] = ["*"]

    # Database
    database_url: str = f"sqlite+aiosqlite:///{Path(__file__).parent / 'data' / 'knowcraft.db'}"

    # LLM provider: "deepseek" | "qwen" | "mock"
    llm_provider: str = "deepseek"

    # DeepSeek
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"
    https_proxy: str = ""  # e.g., "http://127.0.0.1:7890"

    # Qwen (DashScope) — kept for backward compatibility
    dashscope_api_key: str = ""
    llm_model: str = "qwen-plus"

    # Shared LLM params
    llm_max_tokens: int = 500
    llm_temperature: float = 0.8

    # Debate
    debate_max_rounds: int = 5
    debate_turn_timeout: int = 90

    # Paths
    topics_dir: str = str(Path(__file__).parent / "data" / "topics")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
