from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Game, Platform, Source, Status
from app.schemas import GameCreate, GameRead, GameUpdate

router = APIRouter(prefix="/games", tags=["games"])

SORT_COLUMNS = {
    "title": Game.title,
    "playtime": Game.playtime_minutes,
    "rating": Game.rating,
    "date_added": Game.date_added,
}


def get_game_or_404(game_id: int, db: Session) -> Game:
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("", response_model=list[GameRead])
def list_games(
    status: Status | None = None,
    platform: Platform | None = None,
    genre: str | None = None,
    search: str | None = None,
    sort: Literal["title", "playtime", "rating", "date_added"] = "date_added",
    order: Literal["asc", "desc"] = "desc",
    db: Session = Depends(get_db),
):
    query = db.query(Game)

    if status is not None:
        query = query.filter(Game.status == status)
    if platform is not None:
        query = query.filter(Game.platform == platform)
    if search:
        query = query.filter(Game.title.ilike(f"%{search}%"))

    sort_column = SORT_COLUMNS[sort]
    query = query.order_by(asc(sort_column) if order == "asc" else desc(sort_column))

    games = query.all()

    # genres is a JSON list column; SQLite has no portable containment
    # operator for it via SQLAlchemy, so filter in Python post-query.
    if genre:
        games = [g for g in games if g.genres and genre in g.genres]

    return games


@router.get("/{game_id}", response_model=GameRead)
def get_game(game_id: int, db: Session = Depends(get_db)):
    return get_game_or_404(game_id, db)


@router.post("", response_model=GameRead, status_code=201)
def create_game(game_in: GameCreate, db: Session = Depends(get_db)):
    game = Game(**game_in.model_dump(), source=Source.manual)
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


@router.patch("/{game_id}", response_model=GameRead)
def update_game(game_id: int, game_in: GameUpdate, db: Session = Depends(get_db)):
    game = get_game_or_404(game_id, db)
    for field, value in game_in.model_dump(exclude_unset=True).items():
        setattr(game, field, value)
    db.commit()
    db.refresh(game)
    return game


@router.delete("/{game_id}", status_code=204)
def delete_game(game_id: int, db: Session = Depends(get_db)):
    game = get_game_or_404(game_id, db)
    db.delete(game)
    db.commit()
