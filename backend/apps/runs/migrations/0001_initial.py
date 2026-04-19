
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('datasets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Run',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('prompt_template', models.TextField()),
                ('provider', models.CharField(max_length=50)),
                ('model', models.CharField(max_length=100)),
                ('temperature', models.FloatField(default=0.7)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('running', 'Running'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='datasets.dataset')),
            ],
        ),
        migrations.CreateModel(
            name='RunItemResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model_output', models.TextField()),
                ('score', models.FloatField(null=True)),
                ('dataset_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='datasets.datasetitem')),
                ('run', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='results', to='runs.run')),
            ],
        ),
    ]
