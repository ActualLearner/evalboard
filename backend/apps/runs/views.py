from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.datasets.models import Dataset
from .models import Run
from .serializers import RunSerializer
from .services import execute_run


class RunListView(APIView):
    def get(self, request):
        runs = Run.objects.all().order_by("-created_at")
        return Response(RunSerializer(runs, many=True).data)

    def post(self, request):
        api_key = request.headers.get("X-API-Key") or None

        try:
            dataset = Dataset.objects.get(pk=request.data.get("dataset"))
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=404)

        run = Run.objects.create(
            dataset=dataset,
            prompt_template=request.data.get("prompt_template"),
            provider=request.data.get("provider"),
            model=request.data.get("model"),
            temperature=float(request.data.get("temperature", 0.7)),
        )

        try:
            execute_run(run, api_key)
        except Exception as e:
            run.status = "failed"
            run.save()
            return Response({"error": str(e)}, status=500)

        return Response(RunSerializer(run).data, status=status.HTTP_201_CREATED)


class RunDetailView(APIView):
    def get(self, request, pk):
        try:
            run = Run.objects.get(pk=pk)
        except Run.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(RunSerializer(run).data)
