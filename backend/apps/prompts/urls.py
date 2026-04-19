from django.urls import path
from .views import PromptListView, PromptDetailView

urlpatterns = [
    path("", PromptListView.as_view()),
    path("<int:pk>/", PromptDetailView.as_view()),
]
