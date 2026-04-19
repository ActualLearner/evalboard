# Async Execution (Celery)

## Why Celery

Runs can be:

- long
- parallel
- rate-limited

---

## Task Design

### Main Task

run_evaluation(run_id)

---

## Execution Flow

for each dataset item:
enqueue subtask OR process in batch

---

## Strategies

### Option A (MVP)

Single task processes entire dataset.

Pros:

- Simple
  Cons:
- Less scalable

---

### Option B (Better)

One task per dataset item.

Pros:

- Parallelism
- Retry granularity
  Cons:
- More infra complexity

---

## Rate Limiting

Implement:

- request throttling
- exponential backoff

---

## Failure Handling

- store errors per item
- do not fail entire run unless critical

---

## Idempotency

Tasks should be safe to retry.
