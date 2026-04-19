# Dev Workflow

## Local Setup

1. Start Postgres
2. Start Redis
3. Run Django server
4. Run Celery worker
5. Start React dev server

---

## Running a Test Flow

1. Create dataset
2. Create prompt
3. Start run
4. Watch results

---

## Debugging

Use:

- Django admin
- logs
- direct DB queries

---

## Philosophy

DO NOT GUESS.

Every change to prompts or models should be validated via runs.
