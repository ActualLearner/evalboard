# Architecture

## Stack

Frontend:

- React (Vite or Next.js in SPA mode)
- Tailwind (optional)

Backend:

- Django (API layer)
- Django REST Framework (DRF)

Async სამუშაოები:

- Celery + Redis

Database:

- PostgreSQL

---

## High-Level Components

1. React Frontend
2. Django API (DRF)
3. Celery Workers (execution engine)
4. PostgreSQL (source of truth)
5. Redis (queue + caching)

---

## Request Flow

1. User triggers a run (frontend)
2. Django creates Run रिकॉर्ड
3. Django enqueues Celery job
4. Worker processes dataset:
   - Render prompt
   - Call LLM API
   - Score output
5. Results stored in DB
6. Frontend polls or subscribes for updates

---

## Key Design Decisions

### Fat Backend

All evaluation logic lives in Django:

- Prompt rendering
- Scoring
- Execution

React is purely UI.

---

### Async First

Runs MUST NOT block request cycle.

Everything goes through Celery.

---

### Reproducibility

Every run stores:

- prompt snapshot (NOT just FK)
- model + params
- dataset snapshot (optional but recommended)
