# AccessLearn

Accessibility-first e-learning rebuild focused on auth and learner preferences.

## Current Scope

- FastAPI backend with SQLite storage.
- Register, login, authenticated profile, and accessibility preference update APIs.
- Bootstrap auth pages for login, registration, password recovery, and a starter dashboard.
- Learner settings for disability profile, preferred lesson format, captions, high contrast, reduced motion, and screen reader optimization.

## Run Locally

From the project root:

```powershell
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Then open:

```text
http://localhost/finalyearproject/frontend/login.html
```

The frontend API base is configured in `frontend/assets/config.js`.
