from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models import Platform, Source, Status


class GameCreate(BaseModel):
    title: str
    platform: Platform
    status: Status = Status.backlog
    rating: int | None = None
    genres: list[str] | None = None
    cover_url: str | None = None
    notes: str | None = None
    date_completed: datetime | None = None


class GameUpdate(BaseModel):
    title: str | None = None
    platform: Platform | None = None
    status: Status | None = None
    playtime_minutes: int | None = None
    rating: int | None = None
    genres: list[str] | None = None
    cover_url: str | None = None
    notes: str | None = None
    date_completed: datetime | None = None


class GameRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    steam_appid: int | None
    title: str
    platform: Platform
    status: Status
    playtime_minutes: int
    rating: int | None
    genres: list[str] | None
    cover_url: str | None
    notes: str | None
    source: Source
    date_added: datetime
    date_completed: datetime | None


class SettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    steam_id64: str | None
    steam_vanity_url: str | None
    last_synced_at: datetime | None


class SettingsUpdate(BaseModel):
    steam_id64: str | None = None
    steam_vanity_url: str | None = None
