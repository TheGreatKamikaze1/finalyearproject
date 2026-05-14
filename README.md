# Accessible E-Learning

Small FastAPI backend with a static HTML/CSS/JS frontend.

## Structure

- `backend/app/main.py` - FastAPI app, route registration, healthcheck, startup table creation.
- `backend/app/core/` - settings, database engine/session, JWT/password helpers.
- `backend/app/models/` - SQLAlchemy models.
- `backend/app/routers/` - API endpoints for auth, users, courses, materials, accessibility, and progress.
- `backend/app/schemas/` - Pydantic request/response models.
- `frontend/` - static pages and shared assets.
- `railway.json` - Railway build/deploy start command and healthcheck.
- `railpack.json` - Railpack-native start command for Railway builds.

## Local Backend

Create `backend/.env` from `backend/.env.example`, then run:

```powershell
.\venv\Scripts\pip.exe install -r backend\requirements.txt
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API runs on `http://127.0.0.1:8000`.

## Railway Backend

Set these Railway variables on the backend service:

```text
DATABASE_URL=<your Railway PostgreSQL URL>
JWT_SECRET=<long random secret, at least 16 chars>
ENV=production
DEBUG=false
AUTO_CREATE_TABLES=true
CORS_ORIGINS=*
```

The service uses `/healthz` as the healthcheck. On startup, the app creates missing tables when `AUTO_CREATE_TABLES=true`. This project allows all CORS origins because auth uses bearer tokens, not cookies.

If Railway is configured with `backend` as the service root directory, Railpack will use `backend/railpack.json`. If Railway builds from the repo root, it will use `railpack.json`.

For a Railway Postgres service in the same project, set the backend service variable as a reference:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Replace `Postgres` with the actual Railway database service name if yours is different. You can also set `DATABASE_URL` to the public `postgresql://...proxy.rlwy.net.../railway` URL, or provide `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`.

## Frontend API URL

By default the static frontend calls `http://127.0.0.1:8000`.

For a hosted backend, set `window.API_BASE` in `frontend/assets/config.js`:

```js
window.API_BASE = "https://your-railway-backend.up.railway.app";
```

Or set it in the browser console during testing:

```js
localStorage.setItem("api_base", "https://your-railway-backend.up.railway.app");
```
