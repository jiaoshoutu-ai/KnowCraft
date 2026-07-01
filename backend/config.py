import os
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: List[str] = ["*"]

    # LLM
    dashscope_api_key: str = ""
    llm_model: str = "qwen-plus"
    llm_max_tokens: int = 500
    llm_temperature: float = 0.8

    # Debate
    debate_max_rounds: int = 5
    debate_turn_timeout: int = 90

    # Paths
    topics_dir: str = str(Path(__file__).parent / "data" / "topics")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
