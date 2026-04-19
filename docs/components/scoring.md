# Scoring Engine (Django Service)

## Location

backend/evaluations/scoring_engine.py

---

## Interface

score(output, ideal, config) -> ScoreResult

---

## ScoreResult

{
"value": 0.0 - 1.0,
"type": "exact | fuzzy | llm",
"explanation": ""
}

---

## Implementations

### ExactMatchScorer

- strict equality

---

### FuzzyScorer

- token similarity
- Levenshtein

---

### LLMJudgeScorer

- calls LLM
- returns normalized score

---

## Configurable Per Run

Each run can define:

{
"scorer": "exact" | "fuzzy" | "llm",
"threshold": 0.8
}

---

## Important

Scoring MUST be:

- deterministic (except LLM judge)
- logged
- reproducible
