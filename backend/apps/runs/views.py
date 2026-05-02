from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.datasets.models import Dataset
from .models import Run
from .serializers import RunSerializer
from .services import execute_run
from .stats import get_dashboard_stats
from apps.core.llm_client import LLMError

REQUIRES_BYOK = ["openai"]


class RunListView(APIView):
    def get(self, request):
        runs = Run.objects.all().order_by("-created_at")
        return Response(RunSerializer(runs, many=True).data)

    def post(self, request):
        api_key = request.headers.get("X-API-Key") or None
        provider = request.data.get("provider")

        if not api_key and provider in REQUIRES_BYOK:
            return Response(
                {"error": f"{provider} requires you to provide your own API key."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            dataset = Dataset.objects.get(pk=request.data.get("dataset"))
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=404)

        run = Run.objects.create(
            dataset=dataset,
            prompt_template=request.data.get("prompt_template"),
            provider=provider,
            model=request.data.get("model"),
            temperature=float(request.data.get("temperature", 0.7)),
        )

        try:
            execute_run(run, api_key)
        except LLMError as e:
            run.status = "failed"
            run.save()
            http_status = (
                e.status_code if e.status_code in (400, 401, 402, 429) else 502
            )
            return Response({"error": str(e)}, status=http_status)
        except Exception as e:
            run.status = "failed"
            run.save()
            return Response(
                {"error": "An unexpected error occurred. Please try again."}, status=500
            )

        return Response(RunSerializer(run).data, status=status.HTTP_201_CREATED)


class RunDetailView(APIView):
    def get(self, request, pk):
        try:
            run = Run.objects.get(pk=pk)
        except Run.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(RunSerializer(run).data)


class DashboardStatsView(APIView):
    def get(self, request):
        period = request.query_params.get("period", "7d")
        return Response(get_dashboard_stats(period))
