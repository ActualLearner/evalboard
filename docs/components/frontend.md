# Frontend (React)

## Stack

- React
- React Query (server state)
- Axios or fetch
- Tailwind (optional)
- Zustand or Context (light state)

---

## Pages

### /dashboard

- recent runs
- quick stats

---

### /datasets

- list datasets
- upload dataset

---

### /prompts

- list prompts
- edit prompt
- version history

---

### /runs/new

- select dataset
- select prompt version
- choose model + params
- start run

---

### /runs/:id

- status (running/completed)
- results table

---

## Key Components

### ResultsTable

- paginated
- sortable
- expandable rows

---

### PromptEditor

- textarea (MVP)
- version save

---

### RunStatus

- progress bar
- live updates (polling)

---

## Data Fetching

Use React Query:

- caching
- polling for run status
- retries

---

## UX Principles

- fast iteration loop
- highlight failures
- minimal clicks to rerun
