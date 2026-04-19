from django.urls import path
from .views import RunListView, RunDetailView, DashboardStatsView

urlpatterns = [
    path("", RunListView.as_view()),
    path("stats/", DashboardStatsView.as_view()),
    path("<int:pk>/", RunDetailView.as_view()),
]
