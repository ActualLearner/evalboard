import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import api from '../api/client'
import { getErrorMessage } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Legend from '../components/ui/Legend'
import ScoreDonut from '../components/charts/ScoreDonut'

export default function DashboardPage() {
    const [period, setPeriod] = useState('7d')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [stats, setStats] = useState(null)
    const [recentRuns, setRecentRuns] = useState([])
    const [loadingRecentRuns, setLoadingRecentRuns] = useState(true)
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

    useEffect(() => {
        let active = true
        setLoadingRecentRuns(true)

        api
            .get('/api/runs/')
            .then(({ data }) => {
                if (!active) return
                setRecentRuns((data || []).slice(0, 5))
            })
            .catch((err) => {
                if (!active) return
                setError((prev) => prev || getErrorMessage(err, 'Failed to load recent runs.'))
            })
            .finally(() => {
                if (active) setLoadingRecentRuns(false)
            })

        return () => {
            active = false
        }
    }, [])

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

    const avgScoreByModelData = [...(safeStats.top_models || [])]
        .sort((a, b) => (b.avg || 0) - (a.avg || 0))
        .map((m) => ({
            name: `${m.model} (${m.provider})`,
            score: Number(m.avg || 0),
        }))

    const scoreTrendData = (safeStats.runs_over_time || []).map((r) => ({
        date: r.created_at__date,
        score: Number(r.avg_score || 0),
    }))

    const latencyByModelData = [...(safeStats.top_models || [])]
        .sort((a, b) => (a.avg_latency || 0) - (b.avg_latency || 0))
        .map((m) => ({
            name: `${m.model} (${m.provider})`,
            latency: Math.round(m.avg_latency ?? 0),
        }))

    const topDatasets = [...(safeStats.top_datasets || [])]
        .sort((a, b) => (b.run_count || 0) - (a.run_count || 0))
        .slice(0, 5)

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
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                <Card className="lg:col-span-4">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-[18px] font-light leading-none text-slate-500">Avg Score by Model</h2>
                    </div>
                    <div className="mt-3 h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={avgScoreByModelData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" width={220} tick={{ fill: '#475569', fontSize: 11 }} />
                                <Tooltip formatter={(value) => `${Math.round(Number(value) * 100)}%`} />
                                <Bar dataKey="score" fill="#22c55e" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="lg:col-span-4">
                    <h2 className="text-[18px] font-light leading-none text-slate-500">Score Distribution</h2>
                    <div className="mt-3 flex gap-4 text-xs">
                        <Legend color="bg-[#22c55e]" label="perfect" />
                        <Legend color="bg-[#f59e0b]" label="partial" />
                        <Legend color="bg-[#ef4444]" label="failed" />
                    </div>
                    <div className="mt-4 flex justify-center">
                        <ScoreDonut distribution={safeStats.score_distribution} />
                    </div>
                </Card>

                <Card className="lg:col-span-4">
                    <h2 className="text-[18px] font-light leading-none text-slate-500">Top Models</h2>
                    <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <div className="mb-2 flex items-center justify-between">
                            <span>Name</span>
                            <span>Score</span>
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
                                    <span className="text-[12px] normal-case font-semibold text-slate-600">{Math.round(Number(m.avg || 0) * 100)}%</span>
                                </div>
                            ))}
                            {topModels.length === 0 && <p className="text-[12px] normal-case text-slate-500">No model data yet.</p>}
                        </div>
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                <Card className="lg:col-span-6">
                    <div className="flex items-start justify-between">
                        <h2 className="text-[18px] font-light leading-none text-slate-500">Score Trend Over Time</h2>
                    </div>
                    <div className="mt-3 h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={scoreTrendData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip formatter={(value) => Number(value).toFixed(3)} />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#22c55e"
                                    fill="#22c55e"
                                    fillOpacity={0.15}
                                    strokeWidth={2.5}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="lg:col-span-6">
                    <h2 className="text-[18px] font-light leading-none text-slate-500">Latency by Model (ms)</h2>
                    <div className="mt-3 h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={latencyByModelData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" width={220} tick={{ fill: '#475569', fontSize: 11 }} />
                                <Tooltip formatter={(value) => `${value} ms`} />
                                <Bar dataKey="latency" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                <Card className="lg:col-span-6">
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

                <Card className="lg:col-span-6">
                    <h2 className="text-[18px] font-light leading-none text-slate-500">Recent Runs</h2>
                    {loadingRecentRuns ? (
                        <p className="mt-4 text-base text-slate-500">Loading recent runs...</p>
                    ) : (
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Model</th>
                                        <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Provider</th>
                                        <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Dataset</th>
                                        <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Score</th>
                                        <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRuns.map((run) => {
                                        const score = Number(run.avg_score || 0)
                                        const scoreBadgeClass = score >= 0.8
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : score >= 0.5
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-rose-100 text-rose-700'

                                        return (
                                            <tr key={run.id} className="border-b border-[#e4e9f0] text-slate-700 hover:bg-[#f4f7fb]">
                                                <td className="px-2 py-2">{run.model}</td>
                                                <td className="px-2 py-2">{run.provider}</td>
                                                <td className="px-2 py-2">Dataset #{run.dataset}</td>
                                                <td className="px-2 py-2">
                                                    <span className={['rounded px-2 py-1 text-xs font-semibold', scoreBadgeClass].join(' ')}>
                                                        {Math.round(score * 100)}%
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <button
                                                        type="button"
                                                        className="rounded-md border border-[#d3dae3] bg-[#fbfcfd] px-2 py-1 text-xs font-medium hover:bg-[#eef3f8]"
                                                        onClick={() => navigate(`/runs/${run.id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {recentRuns.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-2 py-4 text-center text-slate-500">No recent runs.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </section>
        </div>
    )
}
