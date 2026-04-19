from django.urls import path
from .views import RunListView, RunDetailView

urlpatterns = [
    path("", RunListView.as_view()),
    path("<int:pk>/", RunDetailView.as_view()),
]
