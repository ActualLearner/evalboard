# EvalBoard

EvalBoard is a **single-turn LLM evaluation tool**. Given a dataset of (input, ideal output) pairs and a prompt template, it sends each input through the prompt to a language model, scores the response against the ideal output, and stores the result. Runs can be compared across providers and models through a live analytics dashboard.

---

## Distinctiveness and Complexity

EvalBoard is a domain-specific AI engineering tool with no meaningful overlap with any prior CS50W project. It does not implement a social feed, an auction system, an email client, or a commerce flow. It addresses an active problem in the AI industry which is measuring whether a prompt and model combination produces correct outputs and builds infrastructure around that problem.

### What makes it distinctive

**Multi-provider LLM integration.** EvalBoard connects five external AI APIs simultaneously namely Groq, Anthropic, Gemini, DeepSeek, and OpenAI. It implements a unified abstraction layer built on LiteLLM. Switching providers requires no code changes; the entire difference is one model string. No CS50W project we've done so far has touched external AI provider integration at this level.

**A purpose-built evaluation engine.** The core of the app is a scoring engine that normalizes model outputs before comparison — stripping punctuation, lowercasing, trimming whitespace so that `Paris.` and `paris` both score correctly against `Paris`. So far, we haven't worked on such evaluation techniques in CS50.

**BYOK (Bring Your Own Key) architecture.** API keys for paid providers are stored in the browser's localStorage, injected into request headers by the frontend, read by the backend, passed directly to LiteLLM, and never written to the database. The backend explicitly blocks requests to paid providers when no key is present, returning a descriptive error before any LLM call is made. I personally believe this is the most distinctive feature.

**A data-rich analytics dashboard.** The dashboard aggregates completed eval runs into six distinct views: avg score by model, score distribution (perfect/partial/failed), score trend over time, latency by model, top datasets by usage, and recent runs. All six are powered by a single stats endpoint that performs multiple Django ORM aggregations filtered by a user-supplied time period.

**Dataset and prompt management.** Users can build reusable datasets (with CSV import) and save named prompt templates with `{{input}}` placeholders that can be loaded into any run. This gives the app a proper data management layer on top of the evaluation engine.

### What makes it complex

The application manages five interconnected Django models — Dataset, DatasetItem, Prompt, Run, RunItemResult — where a single eval run produces one Run record and N RunItemResult records, each storing its own score and per-row latency. Aggregate fields (avg score, total failed items, total latency) are computed at run completion time and stored on the Run model so dashboard queries stay efficient.

The REST API has seven(or more) endpoints. The stats endpoint alone performs six ORM aggregations in one request: run counts over time, average scores per model, score distribution buckets, latency averages per model, latency trend over time, and top dataset rankings.

## The frontend is a full React SPA with around eight pages, client-side routing, a reusable API client, a constants-driven model selector that filters by provider, CSV parsing, and the localStorage BYOK functionality. The dashboard renders five Recharts chart types from a single API response

## Tech Stack

**Backend:** Django 6, Django REST Framework, LiteLLM, SQLite, python-dotenv

**Frontend:** React 19, Vite, TailwindCSS, React Router, Axios, Recharts

**LLM Providers:** Groq, Anthropic, Gemini, DeepSeek, OpenAI (BYOK)

---

## File Contents

### Backend (Django / Python)

**Core App (`apps/core/`)**
Contains the our backends essential utilities

- `llm_client.py`: Contains the `call_llm` function. It acts as a wrapper around LiteLLM, and maps requested providers (Groq, Gemini, etc.) to the correct environment variables or user-provided API keys.
- `prompt_renderer.py`: Contains the logic to parse a prompt template and substitute the `{{input}}` placeholders with actual dataset text.
- `scoring.py`: Implements `exact_match` scoring logic. It normalizes outputs by stripping it and lowercasing both the ideal output and the model output before comparison.

**Datasets App (`apps/datasets/`)**

- `models.py`: Defines the `Dataset` and `DatasetItem` models.
- `serializers.py`: DRF serializers to convert Dataset and DatasetItem models to JSON, including nested creation logic so a dataset and its rows can be created in a single POST request.
- `views.py`: API views for listing, creating, and deleting datasets.
- `urls.py`: URL routing for the datasets endpoints.

**Prompts App (`apps/prompts/`)**

- `models.py`: Defines the `Prompt` model to store prompt templates.
- `serializers.py`, `views.py`, `urls.py`: DRF implementation for CRUD operations on user-saved prompts.

**Runs App (`apps/runs/`)**
The main component of our backend, it handles the actual execution of LLM evaluations.

- `models.py`: Defines the `Run` model (storing aggregate data like temperature, model, and status) and `RunItemResult` (storing the exact LLM output and score for individual dataset rows).
- `services.py`: The execution engine. It contains the `execute_run` function which iterates through a dataset, renders the prompt, calls the LLM via the core client, calculates the score, and saves the results to the database.
- `stats.py`: Contains the complex aggregation logic used to power the frontend dashboard charts. `views.py`: API views for creating a run, retrieving run details, and serving the aggregated stats endpoint. It also includes the logic to reject requests that require a BYOK API key but didn't provide one.
- `urls.py`: URL routing for run execution and stats.
- `management/commands/seed.py`: A management command I wrote to instantly seed the database with mock datasets and completed runs for testing purposes.

### Frontend (React / Vite)

**Root & Configuration**

- `src/main.jsx`: The React entry point that mounts the application to the DOM.
- `src/App.jsx`: Sets up `react-router-dom`, defining the URL paths and wrapping the application in the main layout wrapper.
- `src/index.css`: Contains the TailwindCSS v4 initialization directives and global body styling.

**API & Hooks**

- `src/api/client.js`: A centralized Axios instance. It configures the base URL and exports a helper function to dynamically attach the `X-API-Key` header for BYOK providers.
- `src/hooks/useSettings.js`: A custom React hook that reads and writes API keys securely to the browser's `localStorage`.

**Constants**

- `src/constants/models.js`: A configuration dictionary that maps AI providers (e.g., Anthropic) to their available models (e.g., claude-3-haiku), used to dynamically populate the dropdowns on the New Run page.

**Pages (`src/pages/`)**

- `Dashboard.jsx`: Fetches data from the backend `/stats/` endpoint and renders the analytics charts.
- `Datasets.jsx` & `Prompts.jsx`: Views that list existing datasets and prompts, with options to delete them.
- `NewDataset.jsx`: A form allowing users to create datasets manually or import them via CSV parsing.
- `Runs.jsx`: A list view of all historical evaluation runs, color-coded by success/failure status.
- `NewRun.jsx`: The complex form where users select a dataset, provider, model, and temperature, input their API key if required, and trigger the execution engine.
- `RunDetail.jsx`: The results page for a specific run, displaying the overall score and a table comparing the model's outputs against the ideal outputs row-by-row.

**Components (`src/components/`)**

- `layout/Sidebar.jsx` & `Layout.jsx`: The persistent navigation UI shell.
- `ui/StatCard.jsx`, `ScoreBadge.jsx`, `LoadingSpinner.jsx`: Reusable, styled UI atoms used across multiple pages.
- `charts/*.jsx`: Reusable Recharts component wrappers (e.g., `RunsLineChart.jsx`, `ScoreDonut.jsx`) that take raw API data and format it into visual graphs for the Dashboard.

---

## How to Run

### Prerequisites

- Python 3.11+
- Node.js 18+
- At least one LLM API key (Groq is free and recommended to start)

### First time setup

Clone the repo and run:

```bash
make setup
```

This installs all Python and Node dependencies, runs database migrations, and seeds the database with 40 mock eval runs across 4 datasets and 5 providers so the dashboard is populated immediately.

### Environment variables

Copy the example env file and fill in your API keys:

```bash
cp backend/.env.example backend/.env
```

At minimum you need one key. Groq is free with no credit card required at [console.groq.com](https://console.groq.com).

```bash
# backend/.env
SECRET_KEY=your-long-random-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

GROQ_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here      # optional
GEMINI_API_KEY=your_key_here         # optional
DEEPSEEK_API_KEY=your_key_here       # optional
# OpenAI is BYOK only — add your key in the app when running a eval
```

### Running the app

Open two terminals:

```bash
# Terminal 1 — backend
make run-backend

# Terminal 2 — frontend
make run-frontend
```

Then open [http://localhost:5173](http://localhost:5173).

### Individual commands

```bash
make install      # install all dependencies
make migrate      # run database migrations
make seed         # seed mock data
make run-backend  # start Django on port 8000
make run-frontend # start Vite on port 5173
```

---

## How It Works

1. **Create a dataset** — type rows directly in the browser or import a CSV with `input` and `ideal_output` columns.

2. **Write a prompt template** — use `{{input}}` as the placeholder. Save it for reuse or write it inline.

3. **Configure a run** — choose a provider, model, and temperature. OpenAI and Anthropic require your own API key. Gemini requires a key for Pro models. Groq and DeepSeek use shared backend keys by default.

4. **Run the eval** — EvalBoard sends each dataset row through the prompt to the LLM, scores the response against the ideal output, and records latency per row.

5. **Read the results** — every row is scored. Failures are highlighted in red. Avg score and total latency are shown in the summary bar.

6. **Compare on the dashboard** — the dashboard aggregates all runs over time, showing which models score highest, score distribution across all evals, latency trends, and top datasets by usage.

---

## Scoring

Outputs are scored using normalized exact match:

- Strip punctuation
- Lowercase
- Trim whitespace
- Compare

A score of `1.0` means the model output matched the ideal answer after normalization. A score of `0.0` means it did not. Partial scores are reserved for future fuzzy matching.

---

## BYOK (Bring Your Own Key)

| Provider  | Key required?                                                         |
| --------- | --------------------------------------------------------------------- |
| Groq      | No — uses shared backend key by default                               |
| DeepSeek  | No — uses shared backend key by default                               |
| Gemini    | Depends on model — Flash models use shared key, Pro requires your own |
| Anthropic | Yes — always requires your own key                                    |
| OpenAI    | Yes — always requires your own key                                    |

Keys are entered on the New Run page, stored in your browser's localStorage, and sent as an `X-API-Key` request header. They are never written to the database or logged by the server.

---

## Documentation

For the full API reference including all endpoints, request/response shapes, supported models, and dashboard panel mappings, see [`docs/components/backend.md`](docs/backend.md).

---

## Additional Notes

- The application is stateless and session-free. No user accounts or authentication are required.
- SQLite is used for simplicity. For production, swap to PostgreSQL by changing the `DATABASES` setting and installing `psycopg2`.
- The eval execution is synchronous. A run with 20 rows typically completes in 5–30 seconds depending on the provider. A row limit of 50 is recommended for comfortable response times.
- LiteLLM handles all provider differences transparently. Adding a new provider requires one line in `constants/models.js` and one entry in `PROVIDER_ENV_KEYS` in `llm_client.py`.
- Will definitely be continued to implement more LLM evaluation techniques and possibly agent evalutation.
