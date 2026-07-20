from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Game, Source
from app.schemas import GameCreate, GameRead, GameUpdate

router = APIRouter(prefix="/games", tags=["games"])


def get_game_or_404(game_id: int, db: Session) -> Game:
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("", response_model=list[GameRead])
def list_games(db: Session = Depends(get_db)):
    return db.query(Game).all()


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
