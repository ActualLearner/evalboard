from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from apps.datasets.models import Dataset, DatasetItem
from apps.prompts.models import Prompt
from apps.runs.models import Run, RunItemResult


class Command(BaseCommand):
    help = "Seed the database with mock eval data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding...")

        datasets_data = [
            {
                "name": "Geography Trivia",
                "items": [
                    ("What is the capital of France?", "Paris"),
                    ("What is the capital of Japan?", "Tokyo"),
                    ("What is the capital of Brazil?", "Brasilia"),
                    ("What is the capital of Australia?", "Canberra"),
                    ("What is the largest ocean?", "Pacific Ocean"),
                ],
            },
            {
                "name": "Science Basics",
                "items": [
                    ("What is the chemical symbol for water?", "H2O"),
                    ("How many planets are in the solar system?", "8"),
                    ("What gas do plants absorb?", "Carbon dioxide"),
                    ("What is the speed of light?", "299792458 m/s"),
                    ("What is the atomic number of gold?", "79"),
                ],
            },
            {
                "name": "History Facts",
                "items": [
                    ("In what year did World War 2 end?", "1945"),
                    ("Who was the first US president?", "George Washington"),
                    ("In what year did the Berlin Wall fall?", "1989"),
                    ("Who invented the telephone?", "Alexander Graham Bell"),
                    ("What year did the French Revolution begin?", "1789"),
                ],
            },
            {
                "name": "Math Questions",
                "items": [
                    ("What is the square root of 144?", "12"),
                    ("What is 15 percent of 200?", "30"),
                    ("What is the value of pi to 2 decimal places?", "3.14"),
                    ("What is 7 factorial?", "5040"),
                    ("What is 2 to the power of 10?", "1024"),
                ],
            },
        ]

        datasets = []
        for d in datasets_data:
            dataset, _ = Dataset.objects.get_or_create(name=d["name"])
            for input_text, ideal in d["items"]:
                DatasetItem.objects.get_or_create(
                    dataset=dataset,
                    input=input_text,
                    defaults={"ideal_output": ideal},
                )
            datasets.append(dataset)
            self.stdout.write(f"  Dataset: {dataset.name}")

        prompts_data = [
            ("One word answer", "Answer in one word only: {{input}}"),
            ("Concise answer", "Answer concisely in one sentence: {{input}}"),
            ("Expert answer", "You are an expert. Answer precisely: {{input}}"),
        ]
        for name, template in prompts_data:
            Prompt.objects.get_or_create(name=name, defaults={"template": template})

        providers_models = [
            ("groq", "llama-3.1-8b-instant"),
            ("groq", "llama-3.3-70b-versatile"),
            ("anthropic", "claude-haiku-4-5-20251001"),
            ("gemini", "gemini-2.5-flash"),
            ("deepseek", "deepseek-chat"),
        ]

        prompt_templates = [t for _, t in prompts_data]
        partial_outputs = {
            "Pacific Ocean": ["The Pacific is the largest", "It is the Pacific"],
            "Carbon dioxide": ["Plants absorb carbon", "CO2 and carbon"],
            "George Washington": ["Washington was the first", "It was George"],
            "Alexander Graham Bell": ["Bell invented it", "Alexander Bell"],
            "299792458 m/s": ["About 300000 km/s", "299792 meters per second"],
        }

        def get_output_and_score(ideal, model):
            if model in (
                "llama-3.3-70b-versatile",
                "claude-haiku-4-5-20251001",
                "gemini-2.5-flash",
            ):
                outcome = random.choices(
                    ["perfect", "partial", "failed"], weights=[75, 15, 10]
                )[0]
            else:
                outcome = random.choices(
                    ["perfect", "partial", "failed"], weights=[60, 20, 20]
                )[0]

            if outcome == "perfect":
                return ideal, 1.0
            elif outcome == "partial" and ideal in partial_outputs:
                output = random.choice(partial_outputs[ideal])
                ideal_words = set(ideal.lower().split())
                output_words = set(output.lower().split())
                matched = ideal_words & output_words
                score = (
                    round(len(matched) / len(ideal_words), 4) if ideal_words else 0.0
                )
                return output, score
            else:
                return "I do not know", 0.0

        def make_run(created_at):
            dataset = random.choice(datasets)
            provider, model = random.choice(providers_models)
            template = random.choice(prompt_templates)

            run = Run.objects.create(
                dataset=dataset,
                prompt_template=template,
                provider=provider,
                model=model,
                temperature=round(random.uniform(0.0, 1.0), 1),
                status="completed",
            )

            items = list(dataset.items.all())
            scores = []
            total_latency = 0

            for item in items:
                output, score = get_output_and_score(item.ideal_output, model)
                item_latency = round(random.uniform(200, 1800), 2)
                total_latency += item_latency
                scores.append(score)

                run_item = RunItemResult.objects.create(
                    run=run,
                    dataset_item=item,
                    model_output=output,
                    score=score,
                    latency_ms=item_latency,
                )

                if hasattr(run_item, "created_at"):
                    RunItemResult.objects.filter(pk=run_item.pk).update(
                        created_at=created_at
                    )

            run.avg_score = round(sum(scores) / len(scores), 4)
            run.total_items = len(scores)
            run.failed_items = sum(1 for s in scores if s == 0.0)
            run.latency_ms = round(total_latency, 2)
            run.save()
            Run.objects.filter(pk=run.pk).update(created_at=created_at)

        now = timezone.now()
        self.stdout.write("  Creating 20 recent runs (random 9h window today)...")

        window_start_hours_ago = random.uniform(9, 24)
        window_start = now - timedelta(hours=window_start_hours_ago)

        recent_times = [
            window_start + timedelta(seconds=random.uniform(0, 9 * 3600))
            for _ in range(20)
        ]
        recent_times.sort()

        for dt in recent_times:
            make_run(dt)

        self.stdout.write("  Creating 60 historical runs (over the last 90 days)...")

        historical_start = now - timedelta(days=90)
        historical_end = now - timedelta(days=1)

        history_duration_seconds = int(
            (historical_end - historical_start).total_seconds()
        )

        historical_times = [
            historical_start
            + timedelta(seconds=random.randint(0, history_duration_seconds))
            for _ in range(60)
        ]
        historical_times.sort()

        for dt in historical_times:
            make_run(dt)

        self.stdout.write(
            self.style.SUCCESS(
                "Done. 80 runs seeded with dynamic randomized timestamps."
            )
        )
