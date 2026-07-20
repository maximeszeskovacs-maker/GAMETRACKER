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
backend/    FastAPI + SQLAlchemy + Alembic  (not scaffolded yet)
frontend/   React + Vite + TypeScript       (not scaffolded yet)
```

## Running it

> Placeholders — neither side is scaffolded yet. Commands will be filled in as
> the backend and frontend land.

### Backend

```bash
cd backend
# create + activate a virtualenv, then install deps
# uvicorn app.main:app --reload      # → http://localhost:8000
```

API docs will be at `http://localhost:8000/docs`.

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

Step 1 of the build plan: monorepo skeleton only. No app code yet.
