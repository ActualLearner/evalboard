import time
from apps.core.llm_client import call_llm
from apps.core.prompt_renderer import render_prompt
from apps.core.scoring import exact_match
from .models import RunItemResult


def execute_run(run, api_key=None):
    run.status = "running"
    run.save()

    run_start = time.time()
    scores = []
    failed = 0

    for item in run.dataset.items.all():
        prompt = render_prompt(run.prompt_template, item.input)

        item_start = time.time()
        output = call_llm(run.provider, run.model, prompt, run.temperature, api_key)
        item_latency = (time.time() - item_start) * 1000

        score = exact_match(output, item.ideal_output)
        scores.append(score)
        if score == 0.0:
            failed += 1

        RunItemResult.objects.create(
            run=run,
            dataset_item=item,
            model_output=output,
            score=score,
            latency_ms=round(item_latency, 2),
        )

    run.status = "completed"
    run.avg_score = round(sum(scores) / len(scores), 4) if scores else 0
    run.total_items = len(scores)
    run.failed_items = failed
    run.latency_ms = round((time.time() - run_start) * 1000, 2)
    run.save()
