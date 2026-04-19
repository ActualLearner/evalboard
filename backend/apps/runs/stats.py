from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
from .models import Run, RunItemResult


def get_time_filter(period):
    now = timezone.now()
    periods = {
        "24h": now - timedelta(hours=24),
        "7d": now - timedelta(days=7),
        "1m": now - timedelta(days=30),
        "3m": now - timedelta(days=90),
    }
    return periods.get(period)


def get_dashboard_stats(period="7d"):
    since = get_time_filter(period)
    runs = Run.objects.filter(status="completed")
    if since:
        runs = runs.filter(created_at__gte=since)

    total_runs = runs.count()
    overall_avg_score = runs.aggregate(avg=Avg("avg_score"))["avg"] or 0
    total_items_evaluated = runs.aggregate(s=Count("results"))["s"] or 0

    top_models = list(
        runs.values("model", "provider")
        .annotate(avg=Avg("avg_score"), run_count=Count("id"))
        .order_by("-avg")[:6]
    )

    all_results = RunItemResult.objects.filter(run__in=runs)
    score_distribution = {
        "perfect": all_results.filter(score=1.0).count(),
        "partial": all_results.filter(score__gt=0, score__lt=1.0).count(),
        "failed": all_results.filter(score=0.0).count(),
    }

    runs_over_time = list(
        runs.values("created_at__date")
        .annotate(count=Count("id"), avg_score=Avg("avg_score"))
        .order_by("created_at__date")
    )

    latency_over_time = list(
        runs.values("created_at__date")
        .annotate(avg_latency=Avg("latency_ms"))
        .order_by("created_at__date")
    )

    top_datasets = list(
        runs.values("dataset__name", "dataset__id")
        .annotate(run_count=Count("id"), avg_score=Avg("avg_score"))
        .order_by("-run_count")[:5]
    )

    return {
        "summary": {
            "total_runs": total_runs,
            "overall_avg_score": round(overall_avg_score, 4),
            "total_items_evaluated": total_items_evaluated,
        },
        "top_models": top_models,
        "score_distribution": score_distribution,
        "runs_over_time": runs_over_time,
        "latency_over_time": latency_over_time,
        "top_datasets": top_datasets,
    }
