"""Settings — env-driven configuration."""
from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PMC_", env_file=".env")

    # API keys
    anthropic_api_key: str = ""
    tavily_api_key: str = ""
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_host: str = "http://localhost:3000"

    # Sibling services
    doc_rag_url: str = "http://localhost:8000"

    # Model choices
    model_planner: str = "claude-sonnet-4-6-20250929"
    model_worker: str = "claude-sonnet-4-6-20250929"
    model_reviewer: str = "claude-haiku-4-5-20250930"

    # Guardrails
    max_iterations: int = 8
    max_budget_usd: float = 0.50
    tool_timeout_seconds: int = 30
    max_retries: int = 3


settings = Settings()
