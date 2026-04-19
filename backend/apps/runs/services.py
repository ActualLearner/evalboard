from apps.core.llm_client import call_llm
from apps.core.prompt_renderer import render_prompt
from apps.core.scoring import exact_match
from .models import RunItemResult


def execute_run(run, api_key: str):
    run.status = "running"
    run.save()

    for item in run.dataset.items.all():
        prompt = render_prompt(run.prompt_template, item.input)
        output = call_llm(run.provider, run.model, prompt, run.temperature, api_key)
        score = exact_match(output, item.ideal_output)
        RunItemResult.objects.create(
            run=run, dataset_item=item, model_output=output, score=score
        )

    run.status = "completed"
    run.save()
