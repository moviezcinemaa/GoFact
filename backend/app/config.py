import os
from pydantic_settings import BaseSettings
from pydantic import model_validator
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://gofact:gofact_local@localhost:5432/gofact"
    database_url_sync: str = "postgresql://gofact:gofact_local@localhost:5432/gofact"

    # LLM API keys (all optional; the summarizer rotates through whichever are set)
    gemini_api_key: str = ""
    groq_api_key: str = ""
    openrouter_api_key: str = ""

    # Scraper & Cron
    max_articles_per_cycle: int = 20  # Hardcap: Curated Top 20 Daily Digest
    scrape_interval_minutes: int = 1440  # Runs once daily (24 hours)
    cron_secret: str = "gofact-cron-secret-2026"  # X-CRON-KEY for external trigger endpoint

    # App
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    model_config = {
        "env_file": [".env", "../.env"],
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @model_validator(mode='after')
    def fix_database_urls(self) -> 'Settings':
        if self.database_url:
            if self.database_url.startswith("postgres://"):
                self.database_url = self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif self.database_url.startswith("postgresql://") and not self.database_url.startswith("postgresql+asyncpg://"):
                self.database_url = self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

            # asyncpg requires ?ssl=require instead of sslmode, and rejects channel_binding
            if "?" in self.database_url:
                base_part, query_part = self.database_url.split("?", 1)
                from urllib.parse import parse_qs, urlencode
                params = parse_qs(query_part)
                clean_params = {}
                for k, vals in params.items():
                    if k == "sslmode":
                        clean_params["ssl"] = vals[0]
                    elif k in ("ssl",):
                        clean_params[k] = vals[0]
                    elif k not in ("channel_binding",):
                        clean_params[k] = vals[0]
                if "ssl" not in clean_params:
                    clean_params["ssl"] = "require"
                self.database_url = f"{base_part}?{urlencode(clean_params)}"

        if self.database_url_sync:
            if self.database_url_sync.startswith("postgres://"):
                self.database_url_sync = self.database_url_sync.replace("postgres://", "postgresql+psycopg://", 1)
            elif self.database_url_sync.startswith("postgresql://") and not self.database_url_sync.startswith("postgresql+psycopg://"):
                self.database_url_sync = self.database_url_sync.replace("postgresql://", "postgresql+psycopg://", 1)
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
