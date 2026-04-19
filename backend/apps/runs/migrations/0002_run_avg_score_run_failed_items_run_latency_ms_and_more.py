
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('runs', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='run',
            name='avg_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='run',
            name='failed_items',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='run',
            name='latency_ms',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='run',
            name='total_items',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='runitemresult',
            name='latency_ms',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
