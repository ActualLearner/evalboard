from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Prompt
from .serializers import PromptSerializer


class PromptListView(APIView):
    def get(self, request):
        prompts = Prompt.objects.all().order_by("-created_at")
        return Response(PromptSerializer(prompts, many=True).data)

    def post(self, request):
        serializer = PromptSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PromptDetailView(APIView):
    def delete(self, request, pk):
        try:
            prompt = Prompt.objects.get(pk=pk)
        except Prompt.DoesNotExist:
            return Response(status=404)
        prompt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
