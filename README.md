# Game Backlog Manager

A full-stack web app to track your game library through a status pipeline
(`wishlist → backlog → playing → completed / abandoned`), with live sync from
Steam and manual entry for non-Steam titles (WoW, Xbox/Game Pass, etc.).

See [PLAN.md](PLAN.md) for the full design: data model, API surface, Steam sync
flow, and build phases.

## Architecture

```
React SPA  ──HTTP/JSON──▶  FastAPI  ──▶  SQLite
                             │
                             └──httpx──▶  Steam Web API (key in .env)
```

The backend owns all Steam calls — the Steam Web API sends no CORS headers and
the API key must stay server-side, so the browser never talks to Steam directly.

## Layout

```
backend/    FastAPI + SQLAlchemy + Alembic  (health endpoint scaffolded)
frontend/   React + Vite + TypeScript       (not scaffolded yet)
```

## Running it

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows (bash: source .venv/Scripts/activate)
pip install -e .
copy .env.example .env        # then fill in STEAM_API_KEY
uvicorn app.main:app --reload # → http://localhost:8000
```

Verify it's up: `curl http://localhost:8000/health` → `{"status":"ok"}`

API docs are at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
# npm install
# npm run dev                        # → http://localhost:5173
```

## Configuration

The backend reads secrets from `backend/.env` (never committed):

| Variable | Purpose |
|---|---|
| `STEAM_API_KEY` | Steam Web API key — free from `steamcommunity.com/dev/apikey` |
| `DATABASE_URL` | Defaults to a local SQLite file |

Steam sync also needs a **public** Steam profile with game details set to
public, plus your SteamID64 or vanity URL (entered in the app's Settings).

## Status

Backend scaffolded: FastAPI app with CORS (allowing `http://localhost:5173`) and a
`/health` endpoint. No DB models or game endpoints yet. Frontend not scaffolded yet.
