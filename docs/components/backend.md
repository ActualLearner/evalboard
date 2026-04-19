# EvalBoard — Backend API Reference

Base URL: `http://localhost:8000`

All requests and responses use JSON. No authentication required (session-less).

For providers that require a BYOK key (currently `openai`), pass it as a request header:

```
X-API-Key: your_api_key_here
```

If no key is passed, the backend falls back to its own `.env` keys for supported providers (groq, anthropic, gemini).

---

## Datasets

A dataset is a named collection of (input, ideal_output) pairs used as test cases in an eval run.

---

### List all datasets

```
GET /api/datasets/
```

**Response 200**

```json
[
  {
    "id": 1,
    "name": "Geography Test",
    "created_at": "2026-04-19T04:00:00Z",
    "items": [
      {
        "id": 1,
        "input": "What is the capital of France?",
        "ideal_output": "Paris"
      },
      {
        "id": 2,
        "input": "What is the capital of Japan?",
        "ideal_output": "Tokyo"
      }
    ]
  }
]
```

---

### Get a single dataset

```
GET /api/datasets/<id>/
```

**Response 200** — same shape as a single object from the list above.

**Response 404** — dataset not found.

---

### Create a dataset

```
POST /api/datasets/
```

**Request body**

```json
{
  "name": "Geography Test",
  "items": [
    { "input": "What is the capital of France?", "ideal_output": "Paris" },
    { "input": "What is the capital of Japan?", "ideal_output": "Tokyo" }
  ]
}
```

**Response 201** — returns the created dataset object including assigned `id` values.

**Notes**

- `items` must have at least one entry.
- Items are created atomically with the dataset.
- CSV import on the frontend should parse the file client-side and POST this shape.

---

### Delete a dataset

```
DELETE /api/datasets/<id>/
```

**Response 204** — no content.

**Response 404** — dataset not found.

**Note** — deleting a dataset does not delete associated runs, but those runs will lose their dataset reference.

---

## Prompts

A prompt is a saved, reusable template. Templates use `{{input}}` as the placeholder that gets replaced with each dataset item's input at run time.

Example template: `"Answer in one word only: {{input}}"`

---

### List all prompts

```
GET /api/prompts/
```

**Response 200**

```json
[
  {
    "id": 1,
    "name": "One word answer",
    "template": "Answer in one word only: {{input}}",
    "created_at": "2026-04-19T04:49:43Z"
  }
]
```

---

### Create a prompt

```
POST /api/prompts/
```

**Request body**

```json
{
  "name": "One word answer",
  "template": "Answer in one word only: {{input}}"
}
```

**Response 201** — returns the created prompt object.

---

### Delete a prompt

```
DELETE /api/prompts/<id>/
```

**Response 204** — no content.

**Response 404** — prompt not found.

---

## Runs

A run is a single evaluation: one prompt template applied to every item in a dataset, using one model. Each item gets an LLM response and a score.

---

### List all runs

```
GET /api/runs/
```

**Response 200**

```json
[
  {
    "id": 1,
    "dataset": 1,
    "prompt_template": "Answer in one word only: {{input}}",
    "provider": "groq",
    "model": "llama-3.1-8b-instant",
    "temperature": 0.0,
    "status": "completed",
    "created_at": "2026-04-19T04:02:39Z",
    "avg_score": 1.0,
    "total_items": 2,
    "failed_items": 0,
    "latency_ms": 843.2,
    "results": []
  }
]
```

Note: the list view omits `results` for performance. Use the detail endpoint to get per-row results.

---

### Get a single run with results

```
GET /api/runs/<id>/
```

**Response 200**

```json
{
  "id": 1,
  "dataset": 1,
  "prompt_template": "Answer in one word only: {{input}}",
  "provider": "groq",
  "model": "llama-3.1-8b-instant",
  "temperature": 0.0,
  "status": "completed",
  "created_at": "2026-04-19T04:02:39Z",
  "avg_score": 1.0,
  "total_items": 2,
  "failed_items": 0,
  "latency_ms": 843.2,
  "results": [
    {
      "id": 1,
      "dataset_item": {
        "id": 1,
        "input": "What is the capital of France?",
        "ideal_output": "Paris"
      },
      "model_output": "Paris",
      "score": 1.0,
      "latency_ms": 412.5
    },
    {
      "id": 2,
      "dataset_item": {
        "id": 2,
        "input": "What is the capital of Japan?",
        "ideal_output": "Tokyo"
      },
      "model_output": "Tokyo",
      "score": 1.0,
      "latency_ms": 430.7
    }
  ]
}
```

**Response 404** — run not found.

---

### Create and execute a run

```
POST /api/runs/
```

This is synchronous — the request blocks until all LLM calls complete and scores are computed. Expect 2–30 seconds depending on dataset size and model.

**Request body**

```json
{
  "dataset": 1,
  "prompt_template": "Answer in one word only: {{input}}",
  "provider": "groq",
  "model": "llama-3.1-8b-instant",
  "temperature": 0.0
}
```

**Fields**

| Field           | Type    | Required | Notes                                                         |
| --------------- | ------- | -------- | ------------------------------------------------------------- |
| dataset         | integer | yes      | ID of an existing dataset                                     |
| prompt_template | string  | yes      | Must contain `{{input}}`                                      |
| provider        | string  | yes      | One of: `groq`, `anthropic`, `gemini`, `openai`               |
| model           | string  | yes      | Must be valid for the chosen provider (see models list below) |
| temperature     | float   | no       | Default 0.7. Range 0.0–1.0                                    |

**Response 201** — returns the completed run object including all results (same shape as GET detail).

**Response 400** — `openai` provider used without an `X-API-Key` header.

**Response 404** — dataset ID not found.

**Response 500** — LLM call failed (bad API key, rate limit, etc). Returns `{ "error": "..." }`.

---

### Supported providers and models

Use these exact strings in `provider` and `model` fields:

```json
{
  "groq": ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "gemma2-9b-it"],
  "anthropic": ["claude-haiku-4-5-20251001", "claude-sonnet-4-5"],
  "gemini": ["gemini-2.0-flash", "gemini-2.5-pro"],
  "openai": ["gpt-4o", "gpt-4o-mini"]
}
```

OpenAI requires BYOK (`X-API-Key` header). All others use the backend's shared keys by default.

---

## Dashboard Stats

A single endpoint that returns all data needed to render the dashboard. Supports time period filtering.

```
GET /api/runs/stats/?period=7d
```

**Query params**

| Param  | Values                  | Default |
| ------ | ----------------------- | ------- |
| period | `24h`, `7d`, `1m`, `3m` | `7d`    |

**Response 200**

```json
{
  "summary": {
    "total_runs": 12,
    "overall_avg_score": 0.8542,
    "total_items_evaluated": 240
  },
  "top_models": [
    {
      "model": "llama-3.1-8b-instant",
      "provider": "groq",
      "avg": 0.95,
      "run_count": 4
    },
    {
      "model": "gemini-2.0-flash",
      "provider": "gemini",
      "avg": 0.88,
      "run_count": 3
    },
    {
      "model": "claude-haiku-4-5-20251001",
      "provider": "anthropic",
      "avg": 0.82,
      "run_count": 5
    }
  ],
  "score_distribution": {
    "perfect": 180,
    "partial": 20,
    "failed": 40
  },
  "runs_over_time": [
    { "created_at__date": "2026-04-13", "count": 2, "avg_score": 0.75 },
    { "created_at__date": "2026-04-14", "count": 1, "avg_score": 0.9 },
    { "created_at__date": "2026-04-19", "count": 9, "avg_score": 0.87 }
  ],
  "latency_over_time": [
    { "created_at__date": "2026-04-13", "avg_latency": 1200.4 },
    { "created_at__date": "2026-04-14", "avg_latency": 980.1 },
    { "created_at__date": "2026-04-19", "avg_latency": 843.2 }
  ],
  "top_datasets": [
    {
      "dataset__name": "Geography Test",
      "dataset__id": 1,
      "run_count": 6,
      "avg_score": 0.91
    },
    {
      "dataset__name": "Science Quiz",
      "dataset__id": 2,
      "run_count": 3,
      "avg_score": 0.74
    }
  ]
}
```

**Dashboard panel mapping**

| Dashboard Panel              | Data field                                                     |
| ---------------------------- | -------------------------------------------------------------- |
| Total Runs card              | `summary.total_runs`                                           |
| Avg Score card               | `summary.overall_avg_score`                                    |
| Total Items Evaluated card   | `summary.total_items_evaluated`                                |
| Runs over time line chart    | `runs_over_time` — x: date, y: count, second line y: avg_score |
| Score distribution donut     | `score_distribution` — perfect / partial / failed              |
| Top Models list              | `top_models` — sorted by avg score descending                  |
| Top Datasets list            | `top_datasets` — sorted by run_count descending                |
| Latency over time line chart | `latency_over_time` — x: date, y: avg_latency (ms)             |

---

## Scoring

Scores are computed using normalized exact match:

- Strips punctuation, lowercases, trims whitespace before comparing
- `1.0` = exact match after normalization
- `0.0` = no match

Score buckets used in the donut chart:

- **perfect** = score == 1.0
- **partial** = 0.0 < score < 1.0 (currently unused, reserved for future fuzzy scoring)
- **failed** = score == 0.0

---

## Frontend Pages → API calls

| Page            | API calls needed                                                       |
| --------------- | ---------------------------------------------------------------------- |
| `/` Landing     | none                                                                   |
| `/dashboard`    | `GET /api/runs/stats/?period=X`                                        |
| `/datasets`     | `GET /api/datasets/`                                                   |
| `/datasets/new` | `POST /api/datasets/`                                                  |
| `/prompts`      | `GET /api/prompts/`, `POST /api/prompts/`, `DELETE /api/prompts/<id>/` |
| `/runs/new`     | `GET /api/datasets/`, `GET /api/prompts/`, `POST /api/runs/`           |
| `/runs`         | `GET /api/runs/`                                                       |
| `/runs/:id`     | `GET /api/runs/<id>/`                                                  |
