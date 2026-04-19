from django.db import models


class Dataset(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)


class DatasetItem(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name="items")
    input = models.TextField()
    ideal_output = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
