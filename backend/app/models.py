import enum
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Platform(str, enum.Enum):
    pc_steam = "pc_steam"
    pc_battlenet = "pc_battlenet"
    ps5 = "ps5"
    xbox = "xbox"
    switch = "switch"
    other = "other"


class Status(str, enum.Enum):
    wishlist = "wishlist"
    backlog = "backlog"
    playing = "playing"
    completed = "completed"
    abandoned = "abandoned"


class Source(str, enum.Enum):
    steam = "steam"
    manual = "manual"


class Game(Base):
    __tablename__ = "game"

    id: Mapped[int] = mapped_column(primary_key=True)
    steam_appid: Mapped[int | None] = mapped_column(Integer, unique=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    platform: Mapped[Platform] = mapped_column(Enum(Platform), nullable=False)
    status: Mapped[Status] = mapped_column(
        Enum(Status), nullable=False, default=Status.backlog
    )
    playtime_minutes: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    rating: Mapped[int | None] = mapped_column(Integer)
    genres: Mapped[list | None] = mapped_column(JSON)
    cover_url: Mapped[str | None] = mapped_column(String)
    notes: Mapped[str | None] = mapped_column(String)
    source: Mapped[Source] = mapped_column(Enum(Source), nullable=False)
    date_added: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    date_completed: Mapped[datetime | None] = mapped_column(DateTime)


class Settings(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    steam_id64: Mapped[str | None] = mapped_column(String)
    steam_vanity_url: Mapped[str | None] = mapped_column(String)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime)
