from rest_framework import serializers
from .models import Dataset, DatasetItem


class DatasetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetItem
        fields = ["id", "input", "ideal_output"]


class DatasetSerializer(serializers.ModelSerializer):
    items = DatasetItemSerializer(many=True)

    class Meta:
        model = Dataset
        fields = ["id", "name", "created_at", "items"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        dataset = Dataset.objects.create(**validated_data)
        for item in items_data:
            DatasetItem.objects.create(dataset=dataset, **item)
        return dataset

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        instance.name = validated_data.get("name", instance.name)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                DatasetItem.objects.create(dataset=instance, **item)

        return instance
