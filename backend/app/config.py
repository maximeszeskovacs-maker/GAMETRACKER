from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    steam_api_key: str = ""
    database_url: str = "sqlite:///./backlog.db"


settings = Settings()
