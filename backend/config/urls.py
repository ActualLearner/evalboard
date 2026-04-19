from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/datasets/", include("apps.datasets.urls")),
    path("api/runs/", include("apps.runs.urls")),
]
