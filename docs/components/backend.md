# Backend (Django)

## Apps Structure

- datasets/
- prompts/
- runs/
- evaluations/
- core/ (shared utilities)

---

## Key Models

### Dataset

- name
- description
- created_at

### DatasetItem

- dataset (FK)
- input (text/json)
- ideal_output (text/json)
- metadata (json)

---

### Prompt

- name
- current_version

### PromptVersion

- prompt (FK)
- template (text)
- version_number

---

### Run

- dataset (FK)
- prompt_version (FK)
- model
- params (json)
- status
- created_at

---

### RunItemResult

- run (FK)
- dataset_item (FK)
- model_output
- score
- metadata (json)

---

## API Endpoints (DRF)

### Datasets

- POST /datasets/
- GET /datasets/
- GET /datasets/:id/

### Prompts

- POST /prompts/
- POST /prompts/:id/versions/
- GET /prompts/

### Runs

- POST /runs/start/
- GET /runs/
- GET /runs/:id/

### Results

- GET /runs/:id/results/

---

## Services Layer (IMPORTANT)

Do NOT put logic in views.

Create service modules:

- run_executor.py
- prompt_renderer.py
- scoring_engine.py

---

## Admin Panel

Expose:

- datasets
- runs
- results

This becomes your internal debugging superpower.
