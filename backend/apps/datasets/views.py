from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Dataset
from .serializers import DatasetSerializer


class DatasetListView(APIView):
    def get(self, request):
        datasets = Dataset.objects.all().order_by("-created_at")
        return Response(DatasetSerializer(datasets, many=True).data)

    def post(self, request):
        serializer = DatasetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DatasetDetailView(APIView):
    def get_object(self, pk):
        try:
            return Dataset.objects.get(pk=pk)
        except Dataset.DoesNotExist:
            return None

    def get(self, request, pk):
        dataset = self.get_object(pk)
        if not dataset:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(DatasetSerializer(dataset).data)

    def put(self, request, pk):
        dataset = self.get_object(pk)
        if not dataset:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = DatasetSerializer(dataset, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        dataset = self.get_object(pk)
        if not dataset:
            return Response(status=status.HTTP_404_NOT_FOUND)
        dataset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
