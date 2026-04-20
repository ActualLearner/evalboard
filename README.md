# EvalBoard

EvalBoard is a **single-turn LLM evaluation tool**. Given a dataset of (input, ideal output) pairs and a prompt template, it sends each input through the prompt to a language model, scores the response against the ideal output, and stores the result. Runs can be compared across providers and models through a live analytics dashboard.

---

## Distinctiveness and Complexity

EvalBoard is a domain-specific AI engineering tool with no meaningful overlap with any prior CS50W project. It does not implement a social feed, an auction system, an email client, or a commerce flow. It addresses a concrete problem in the AI industry — systematically measuring whether a prompt and model combination produces correct outputs — and builds purpose-built infrastructure around that problem.

### What makes it distinctive

**Multi-provider LLM integration.** EvalBoard connects to five external AI APIs simultaneously — Groq, Anthropic, Gemini, DeepSeek, and OpenAI — through a unified abstraction layer built on LiteLLM. Switching providers requires no code changes; the entire difference is one model string. No CS50W project we've done so far has touched external AI provider integration at this level.

**A purpose-built evaluation engine.** The core of the app is a scoring engine that normalizes model outputs before comparison — stripping punctuation, lowercasing, trimming whitespace — so that `Paris.` and `paris` both score correctly against `Paris`. So far, we haven't worked on such evaluation techniques in CS50.

**BYOK (Bring Your Own Key) architecture.** API keys for paid providers are stored in the browser's localStorage, injected into request headers by the frontend, read by the backend, passed directly to LiteLLM, and never written to the database. The backend explicitly blocks requests to paid providers when no key is present, returning a descriptive error before any LLM call is made.

**A data-rich analytics dashboard.** The dashboard aggregates completed eval runs into six distinct views: avg score by model, score distribution (perfect/partial/failed), score trend over time, latency by model, top datasets by usage, and recent runs. All six are powered by a single stats endpoint that performs multiple Django ORM aggregations filtered by a user-supplied time period.

**Dataset and prompt management.** Users can build reusable datasets (with CSV import) and save named prompt templates with `{{input}}` placeholders that can be loaded into any run. This gives the app a proper data management layer on top of the evaluation engine.

### What makes it complex

The application manages five interconnected Django models — Dataset, DatasetItem, Prompt, Run, RunItemResult — where a single eval run produces one Run record and N RunItemResult records, each storing its own score and per-row latency. Aggregate fields (avg score, total failed items, total latency) are computed at run completion time and stored on the Run model so dashboard queries stay efficient.

The REST API has seven endpoints. The stats endpoint alone performs six ORM aggregations in one request: run counts over time, average scores per model, score distribution buckets, latency averages per model, latency trend over time, and top dataset rankings.

## The frontend is a full React SPA with eight pages, client-side routing, a reusable API client, a constants-driven model selector that filters by provider, CSV parsing, and the localStorage BYOK functionality. The dashboard renders five Recharts chart types from a single API response

## Tech Stack

**Backend:** Django 6, Django REST Framework, LiteLLM, SQLite, python-dotenv

**Frontend:** React 19, Vite, TailwindCSS, React Router, Axios, Recharts

**LLM Providers:** Groq, Anthropic, Gemini, DeepSeek, OpenAI (BYOK)

---

## File Structure

```
evalboard/
├── Makefile
├── README.md
├── .gitignore
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/                          # Django settings, URLs, WSGI
│   └── apps/
│       ├── core/                        # llm_client.py, prompt_renderer.py, scoring.py
│       ├── datasets/                    # Dataset + DatasetItem models, API
│       ├── prompts/                     # Prompt model, API
│       └── runs/                        # Run + RunItemResult models, eval engine, stats, seed command
│
├── frontend/
│   └── src/
│       ├── api/                         # client.js — all axios calls
│       ├── assets/                      # Static assets
│       ├── constants/                   # providerModels.js, navItems.js
│       ├── utils/                       # csv.js, format.js
│       ├── components/
│       │   ├── charts/                  # AvgScoreBars, LatencyChart, ScoreDonut, TwoLineChart
│       │   ├── icons/                   # AppIcons
│       │   ├── layout/                  # AppLayout
│       │   └── ui/                      # Card, ScoreBadge, StatCard, ScrollableSelect, SummaryPill, Legend, InlineError
│       └── pages/                       # DashboardPage, DatasetsPage, DocsPage, NewDatasetPage, NewRunPage, PromptsPage, RunDetailPage, RunsPage
│
└── docs/
    ├── architecture.md
    ├── requirements.md
    └── components/
        ├── backend.md                   # Full API reference
        ├── frontend.md
        ├── scoring.md
        └── dev-workflow.md
```

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
