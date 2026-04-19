from django.db import models


class Prompt(models.Model):
    name = models.CharField(max_length=255)
    template = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
