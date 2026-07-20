# Game Backlog Manager — Build Plan

A full-stack web app to track your game library through a status pipeline, with live
sync from Steam and manual entry for non-Steam titles (WoW, Xbox/Game Pass, etc.).

---

## Decisions made (override any of these)

| Area | Default choice | Why | Alternatives |
|---|---|---|---|
| Backend framework | **FastAPI** | Async, auto-generated OpenAPI docs, Pydantic validation | Flask, Django REST |
| Frontend | **React + Vite + TypeScript** | Fast dev server, typed API models | Next.js if you want SSR/routing built in |
| DB (dev) | **SQLite** via SQLAlchemy + Alembic | Zero-config, single file | Postgres (swap the connection string) |
| DB (prod, optional) | Postgres | Multi-user / deployment | Stay on SQLite for a solo demo |
| Steam integration | **Live sync through the backend** | Keeps API key server-side, re-syncable | One-time import script if you prefer static demo data |
| Auth | **None for demo** (single user) | Smaller scope | "Sign in through Steam" (OpenID) as a stretch goal |
| HTTP client (backend) | `httpx` | Async, plays well with FastAPI | `requests` |

> **Why a backend is required for Steam:** the Steam Web API sends no CORS headers,
> so the browser can't call it directly, and the API key is a secret that must not sit
> in frontend code. The Python backend acts as a proxy + cache.

---

## Architecture

```
React SPA  ──HTTP/JSON──▶  FastAPI  ──▶  SQLite/Postgres
                             │
                             └──httpx──▶  Steam Web API (key in .env)
```

The backend owns all Steam calls, persists results, and serves a clean REST API to the
frontend. Steam data is cached in the DB so the UI never waits on Steam directly.

---

## Data model

**Game**
- `id` (PK)
- `steam_appid` (int, nullable — null for manually added games)
- `title` (str)
- `platform` (enum: `pc_steam`, `pc_battlenet`, `ps5`, `xbox`, `switch`, `other`)
- `status` (enum: `wishlist`, `backlog`, `playing`, `completed`, `abandoned`)
- `playtime_minutes` (int, default 0)
- `rating` (int 1–10, nullable)
- `genres` (list / JSON, nullable)
- `cover_url` (str, nullable)
- `notes` (str, nullable)
- `source` (enum: `steam`, `manual`)
- `date_added` (datetime)
- `date_completed` (datetime, nullable)

**Settings** (single row for the demo)
- `steam_id64` (str, nullable)
- `steam_vanity_url` (str, nullable)
- `last_synced_at` (datetime, nullable)

---

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/games` | List with query params: `status`, `platform`, `genre`, `search`, `sort`, `order` |
| `POST` | `/games` | Add a manual game |
| `GET` | `/games/{id}` | Single game |
| `PATCH` | `/games/{id}` | Edit any field (status, rating, notes…) |
| `DELETE` | `/games/{id}` | Remove a game |
| `POST` | `/steam/sync` | Pull library from Steam and upsert |
| `POST` | `/games/{id}/enrich` | Fetch cover + genres from the store endpoint |
| `GET` | `/stats` | Aggregate stats for the dashboard |
| `GET` | `/settings` / `PATCH` `/settings` | Read/update Steam ID + vanity URL |
| `GET` | `/export` / `POST` `/import` | CSV/JSON round-trip |

---

## Steam sync flow

1. If only a vanity URL is stored, call `ISteamUser/ResolveVanityURL` → get SteamID64.
2. `IPlayerService/GetOwnedGames` (with `include_appinfo=1`) → for each game upsert by
   `steam_appid`: set `title`, `playtime_minutes`, `source=steam`, `platform=pc_steam`.
3. `IPlayerService/GetRecentlyPlayedGames` → optionally flag those as `playing`.
4. Enrichment: the store `appdetails` endpoint fills `cover_url` and `genres`. It's
   undocumented and rate-limited, so batch it, cache results, and run it lazily rather
   than for the whole library at once.
5. **Preserve user edits on re-sync** — never overwrite `status`, `rating`, or `notes`
   for games that already exist. Only refresh playtime and metadata.

**Prerequisites the user must supply**
- A Steam Web API key (free: `steamcommunity.com/dev/apikey`) → `STEAM_API_KEY` in `.env`.
- A **public** Steam profile with game details set to public, or `GetOwnedGames` returns empty.
- SteamID64 or vanity URL.

**What Steam can't provide:** status labels (yours, subjective), and anything non-Steam.
Battle.net (WoW) and Xbox/Game Pass Forza stay manual — design the UI so imported and
manual games coexist cleanly.

---

## Stats dashboard

- Count per status (backlog / playing / completed / abandoned / wishlist)
- Total hours played (sum of `playtime_minutes` / 60)
- Completion rate (completed ÷ non-wishlist)
- Hours by platform (bar chart)
- Top genres (from enriched data)
- Backlog size number + "what to play next" suggestion (weighted: high rating, low
  playtime, oldest `date_added`)

Use `recharts` on the frontend for the charts.

---

## Frontend views

- **Library** — filterable/sortable table with search; inline status dropdown.
- **Board** — kanban columns by status, drag a card to change status.
- **Game detail / edit** — modal or side panel; edit all fields, trigger enrich.
- **Stats** — the dashboard above.
- **Settings** — Steam ID / vanity URL, "Sync now" button, last-synced timestamp.

Consider TanStack Query for server-state (caching, refetch after mutations).

---

## Project structure

```
game-backlog/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS
│   │   ├── database.py        # engine, session
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── games.py
│   │   │   ├── stats.py
│   │   │   ├── steam.py
│   │   │   └── settings.py
│   │   └── services/
│   │       └── steam.py       # httpx calls, resolve/owned/recent/appdetails
│   ├── alembic/               # migrations
│   ├── pyproject.toml
│   └── .env.example           # STEAM_API_KEY=, DATABASE_URL=
├── frontend/
│   ├── src/
│   │   ├── api/               # typed fetch wrappers
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts         # proxy /api → backend in dev
└── README.md
```

---

## Build phases (incremental — good for Claude Code)

1. **Scaffold** both apps; wire CORS; frontend fetches a `/health` endpoint.
2. **DB + CRUD** — models, migrations, `/games` endpoints, basic table in the UI.
3. **Manual entry** — add/edit/delete UI with a form.
4. **Steam sync** — `services/steam.py`, `/steam/sync`, Settings page + Sync button.
5. **Enrichment** — covers/genres via `appdetails`, with caching + rate-limit handling.
6. **Filter / sort / search** — query params end-to-end.
7. **Stats dashboard** — `/stats` + charts.
8. **Kanban board** — drag-to-change-status.
9. **Polish** — CSV/JSON import/export, empty states, error handling, loading states.
10. **Stretch** — Steam OpenID login, Docker Compose, deploy.

---

## Gotchas to keep in mind

- **CORS**: configure `CORSMiddleware` in FastAPI to allow the Vite dev origin.
- **Secrets**: `STEAM_API_KEY` lives only in the backend `.env`; never ship it to the client.
- **Playtime units**: Steam returns *minutes* — convert for display.
- **`appdetails` rate limits**: roughly a couple hundred requests per few minutes;
  batch, cache, and enrich lazily.
- **Public profile requirement**: surface a clear error if `GetOwnedGames` comes back empty.
- **Re-sync safety**: protect user-set `status` / `rating` / `notes` from being overwritten.

---

## Testing

- Backend: `pytest` — CRUD, filter logic, and a mocked Steam service (don't hit the real API in tests).
- Frontend: `vitest` + React Testing Library for key components (optional for a demo).

---

## Verify before building

Steam's Web API endpoint names, parameters, and rate limits do shift, and the store
`appdetails` endpoint is unofficial. When you start in Claude Code, pull the current
Steam Web API docs to confirm exact params rather than relying on this plan verbatim.
