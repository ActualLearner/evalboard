from django.db import models
from apps.datasets.models import Dataset, DatasetItem


class Run(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    prompt_template = models.TextField()
    provider = models.CharField(max_length=50)
    model = models.CharField(max_length=100)
    temperature = models.FloatField(default=0.7)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    avg_score = models.FloatField(null=True, blank=True)
    total_items = models.IntegerField(default=0)
    failed_items = models.IntegerField(default=0)
    latency_ms = models.FloatField(null=True, blank=True)


class RunItemResult(models.Model):
    run = models.ForeignKey(Run, on_delete=models.CASCADE, related_name="results")
    dataset_item = models.ForeignKey(DatasetItem, on_delete=models.CASCADE)
    model_output = models.TextField()
    score = models.FloatField(null=True)
    latency_ms = models.FloatField(null=True, blank=True)
