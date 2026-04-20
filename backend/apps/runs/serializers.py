from rest_framework import serializers
from apps.datasets.serializers import DatasetItemSerializer
from .models import Run, RunItemResult


class RunItemResultSerializer(serializers.ModelSerializer):
    dataset_item = DatasetItemSerializer()

    class Meta:
        model = RunItemResult
        fields = [
            "id",
            "dataset_item",
            "model_output",
            "score",
            "latency_ms",
        ]


class RunSerializer(serializers.ModelSerializer):
    results = RunItemResultSerializer(many=True, read_only=True)

    class Meta:
        model = Run
        fields = [
            "id",
            "dataset",
            "prompt_template",
            "provider",
            "model",
            "temperature",
            "status",
            "created_at",
            "avg_score",
            "total_items",
            "failed_items",
            "latency_ms",  # ← latency_ms here
            "results",
        ]
