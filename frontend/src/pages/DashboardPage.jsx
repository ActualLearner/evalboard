import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { formatShortDate, getErrorMessage } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Legend from '../components/ui/Legend'
import TwoLineChart from '../components/charts/TwoLineChart'
import ScoreDonut from '../components/charts/ScoreDonut'
import LatencyChart from '../components/charts/LatencyChart'
import AvgScoreBars from '../components/charts/AvgScoreBars'

export default function DashboardPage() {
    const [period, setPeriod] = useState('7d')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [stats, setStats] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        let active = true
        setLoading(true)
        setError('')

        api
            .get('/api/runs/stats/', { params: { period } })
            .then(({ data }) => {
                if (!active) return
                setStats(data)
            })
            .catch((err) => {
                if (!active) return
                setError(getErrorMessage(err, 'Failed to load dashboard stats.'))
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [period])

    const safeStats = stats ?? {
        summary: { total_runs: 0, overall_avg_score: 0, total_items_evaluated: 0 },
        top_models: [],
        score_distribution: { perfect: 0, partial: 0, failed: 0 },
        runs_over_time: [],
        latency_over_time: [],
        top_datasets: [],
    }

    const topModels = [...(safeStats.top_models || [])]
        .sort((a, b) => (b.avg || 0) - (a.avg || 0))
        .slice(0, 6)

    const topDatasets = [...(safeStats.top_datasets || [])]
        .sort((a, b) => (b.run_count || 0) - (a.run_count || 0))
        .slice(0, 5)

    const runsCounts = (safeStats.runs_over_time || []).map((item) => item.count || 0)
    const runsAvgs = (safeStats.runs_over_time || []).map((item) => item.avg_score || 0)
    const runLabels = (safeStats.runs_over_time || []).map((item) => formatShortDate(item.created_at__date))
    const latencyValues = (safeStats.latency_over_time || []).map((item) => item.avg_latency || 0)
    const latencyLabels = (safeStats.latency_over_time || []).map((item) => formatShortDate(item.created_at__date))

    return (
        <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Dashboard</h1>

            <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex overflow-hidden rounded-xl border border-[#d2d8de] bg-[#fbfcfd]">
                    {[
                        { label: '24H', value: '24h' },
                        { label: '7D', value: '7d' },
                        { label: '1M', value: '1m' },
                        { label: '3M', value: '3m' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            className={[
                                'px-3 py-2 text-xs font-medium transition',
                                period === opt.value
                                    ? 'bg-[#bce7ff] text-slate-900'
                                    : 'text-slate-700 hover:bg-[#eef2f6]',
                            ].join(' ')}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {error ? <InlineError message={error} /> : null}

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                <StatCard title="Total Runs" value={safeStats.summary.total_runs} className="lg:col-span-4" loading={loading} />
                <StatCard
                    title="Avg Score"
                    value={Number(safeStats.summary.overall_avg_score || 0).toFixed(3)}
                    className="lg:col-span-4"
                    loading={loading}
                />
                <StatCard
                    title="Total Items Evaluated"
                    value={safeStats.summary.total_items_evaluated}
                    className="lg:col-span-4"
                    loading={loading}
                />

                <Card className="lg:col-span-6 pb-2">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-[18px] font-light leading-none text-slate-500">Runs Over Time</h2>
                        <div className="mt-1 flex gap-4 text-xs">
                            <Legend color="bg-emerald-500" label="count" />
                            <Legend color="bg-[#4d8ef0]" label="avg score" />
                        </div>
                    </div>
                    <TwoLineChart labels={runLabels} first={runsCounts} second={runsAvgs} secondAsFraction />
                </Card>

                <Card className="lg:col-span-3">
                    <h2 className="text-[18px] font-light leading-none text-slate-500">Score Distribution</h2>
                    <div className="mt-3 flex gap-4 text-xs">
                        <Legend color="bg-emerald-500" label="perfect" />
                        <Legend color="bg-amber-400" label="partial" />
                        <Legend color="bg-rose-500" label="failed" />
                    </div>
                    <div className="mt-4 flex justify-center">
                        <ScoreDonut distribution={safeStats.score_distribution} />
                    </div>
                </Card>

                <Card className="lg:col-span-3">
                    <h2 className="text-[18px] font-light leading-none text-slate-500">Top Models</h2>
                    <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <div className="mb-2 flex items-center justify-between">
                            <span>Name</span>
                            <span>Runs</span>
                        </div>
                        <div className="space-y-2">
                            {topModels.map((m) => (
                                <div key={`${m.provider}-${m.model}`} className="flex items-center gap-2">
                                    <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-[#edf2f7]">
                                        <div className="h-full rounded-md bg-[#8dd9a9]" style={{ width: `${Math.max(6, (m.avg || 0) * 100)}%` }} />
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] normal-case font-medium text-slate-700">
                                            {m.model} ({m.provider})
                                        </span>
                                    </div>
                                    <span className="text-[12px] normal-case font-semibold text-slate-600">{m.run_count ?? 0}</span>
                                </div>
                            ))}
                            {topModels.length === 0 && <p className="text-[12px] normal-case text-slate-500">No model data yet.</p>}
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-6 pb-2">
                    <div className="flex items-start justify-between">
                        <h2 className="text-[18px] font-light leading-none text-slate-500">Latency Over Time</h2>
                        <Legend color="bg-[#22b8db]" label="ms" />
                    </div>
                    <LatencyChart labels={latencyLabels} values={latencyValues} />
                </Card>

                <Card className="lg:col-span-3">
                    <h2 className="text-[18px] font-light leading-none text-slate-500">Top Datasets</h2>
                    <div className="mt-4 space-y-2">
                        {topDatasets.map((d) => (
                            <button
                                key={d.dataset__id}
                                className="flex w-full items-center gap-2 rounded-lg bg-[#edf2f7] px-2 py-2 text-left hover:bg-[#e7eef6]"
                                onClick={() => navigate(`/datasets?highlight=${d.dataset__id}`)}
                            >
                                <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-700">{d.dataset__name}</span>
                                <span className="text-[12px] text-slate-600">runs: {d.run_count}</span>
                                <span className="text-[12px] text-slate-600">avg: {Number(d.avg_score || 0).toFixed(2)}</span>
                            </button>
                        ))}
                        {topDatasets.length === 0 && <p className="text-[12px] text-slate-500">No dataset stats yet.</p>}
                    </div>
                </Card>

                <Card className="lg:col-span-3">
                    <div className="flex items-start justify-between">
                        <h2 className="text-[18px] font-light leading-none text-slate-500">Avg Score Over Time</h2>
                    </div>
                    <p className="mt-3 text-[22px] font-normal leading-none tracking-tight text-slate-900">
                        {Number(safeStats.summary.overall_avg_score || 0).toFixed(3)}
                    </p>
                    <AvgScoreBars labels={runLabels} values={runsAvgs} />
                </Card>
            </section>
        </div>
    )
}
