# EvalBoard

EvalBoard is a lightweight LLM evaluation harness.

It allows you to:

- Upload datasets of (input, ideal_output) pairs
- Run them against prompt templates via API
- Score outputs using multiple evaluation strategies
- Compare runs across prompts, models, and parameters

## Core Philosophy

Prompts are code.  
This system treats them as testable, versioned artifacts.

## Key Features

- Dataset-driven evaluation
- Prompt templating + versioning
- Batch LLM execution
- Pluggable scoring (rules, LLM-as-judge, etc.)
- Run comparison + regression detection

## MVP Scope

- Dataset upload (JSON/CSV)
- Prompt template editor
- Run execution
- Scoring pipeline
- Basic UI for results

## Non-Goals (for now)

- Full RAG pipelines
- Fine-tuning workflows
- Complex agent systems

## Mental Model

EvalBoard = "PyTest for prompts"
