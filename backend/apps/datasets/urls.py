from django.urls import path
from .views import DatasetListView, DatasetDetailView

urlpatterns = [
    path("", DatasetListView.as_view()),
    path("<int:pk>/", DatasetDetailView.as_view()),
]
