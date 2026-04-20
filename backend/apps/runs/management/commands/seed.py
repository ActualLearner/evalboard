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
                    dataset=dataset, input=input_text, defaults={"ideal_output": ideal}
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

        for i in range(40):
            dataset = random.choice(datasets)
            provider, model = random.choice(providers_models)
            template = random.choice(prompt_templates)
            days_ago = random.randint(0, 29)
            created = timezone.now() - timedelta(days=days_ago)

            run = Run.objects.create(
                dataset=dataset,
                prompt_template=template,
                provider=provider,
                model=model,
                temperature=round(random.uniform(0.0, 1.0), 1),
                status="completed",
                created_at=created,
            )

            items = list(dataset.items.all())
            scores = []
            total_latency = 0

            for item in items:
                if model in (
                    "llama-3.3-70b-versatile",
                    "claude-haiku-4-5-20251001",
                    "gemini-2.5-flash",
                ):
                    score = random.choices([1.0, 0.0], weights=[85, 15])[0]
                else:
                    score = random.choices([1.0, 0.0], weights=[70, 30])[0]

                item_latency = round(random.uniform(200, 1800), 2)
                total_latency += item_latency
                scores.append(score)

                RunItemResult.objects.create(
                    run=run,
                    dataset_item=item,
                    model_output=item.ideal_output if score == 1.0 else "I do not know",
                    score=score,
                    latency_ms=item_latency,
                )

            run.avg_score = round(sum(scores) / len(scores), 4)
            run.total_items = len(scores)
            run.failed_items = scores.count(0.0)
            run.latency_ms = round(total_latency, 2)
            run.save()

        self.stdout.write(self.style.SUCCESS("Done. 40 runs seeded across 30 days."))
