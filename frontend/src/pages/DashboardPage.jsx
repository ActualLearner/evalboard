import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
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
    const [allRuns, setAllRuns] = useState([])
    const [recentRuns, setRecentRuns] = useState([])
    const [loadingRecentRuns, setLoadingRecentRuns] = useState(true)
    const navigate = useNavigate()
    const statsPeriod = period === 'all' ? undefined : period

    useEffect(() => {
        let active = true
        setLoading(true)
        setError('')

        api
            .get('/api/runs/stats/', statsPeriod ? { params: { period: statsPeriod } } : undefined)
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
                const runs = data || []
                setAllRuns(runs)
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

    useEffect(() => {
        setRecentRuns(getRecentRunsByPeriod(allRuns, period))
    }, [allRuns, period])

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

    const scoreTrend = buildProviderTrendSeries(allRuns, period)
    const scoreTrendProviders = scoreTrend.providers
    const scoreTrendData = scoreTrend.points

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
                        { label: 'ALL', value: 'all' },
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
                    {scoreTrendProviders.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                            {scoreTrendProviders.map((provider, index) => (
                                <span key={provider} className="inline-flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: trendColors[index % trendColors.length] }} />
                                    {formatProviderLabel(provider)}
                                </span>
                            ))}
                        </div>
                    ) : null}
                    <div className="mt-3 h-64 w-full">
                        {scoreTrendData.length > 0 && scoreTrendProviders.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={scoreTrendData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} minTickGap={18} />
                                    <YAxis domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip formatter={(value, name) => [Number(value).toFixed(3), name]} />
                                    {scoreTrendProviders.map((provider, index) => (
                                        <Line
                                            key={provider}
                                            name={formatProviderLabel(provider)}
                                            type="monotone"
                                            dataKey={provider}
                                            stroke={trendColors[index % trendColors.length]}
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                            connectNulls
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#d8dee6] bg-[#fbfcfd] text-sm text-slate-500">
                                No trend data for the selected period.
                            </div>
                        )}
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

function buildProviderTrendSeries(runs, period) {
    const cutoff = getPeriodCutoff(period, runs)
    const filteredRuns = runs.filter((run) => {
        const createdAt = new Date(run.created_at)
        return Number.isNaN(createdAt.getTime()) ? false : createdAt >= cutoff
    })

    const providerKeys = []
    const providerSet = new Set()
    for (const run of filteredRuns) {
        const key = getProviderKey(run)
        if (!providerSet.has(key)) {
            providerSet.add(key)
            providerKeys.push(key)
        }
    }

    const config = getTrendConfig(period, cutoff, filteredRuns)
    const buckets = new Map()
    for (const run of filteredRuns) {
        const createdAt = new Date(run.created_at)
        if (Number.isNaN(createdAt.getTime())) continue

        const bucketStart = getBucketStart(createdAt, config)
        const key = bucketStart.getTime()
        const providerKey = getProviderKey(run)
        const bucket = buckets.get(key) || new Map()
        if (!bucket.has(providerKey)) {
            bucket.set(providerKey, { total: 0, count: 0 })
        }
        const aggregate = bucket.get(providerKey)
        aggregate.total += Number(run.avg_score || 0)
        aggregate.count += 1
        buckets.set(key, bucket)
    }

    const startDate = new Date(config.start)
    const endDate = new Date(config.end)

    const series = []
    for (let cursor = new Date(startDate); cursor <= endDate; cursor = addTimeStep(cursor, config.stepMs)) {
        const bucket = buckets.get(cursor.getTime())
        const point = {
            label: formatTrendLabel(cursor, period, config.stepMs),
        }

        for (const providerKey of providerKeys) {
            const aggregate = bucket?.get(providerKey)
            point[providerKey] = aggregate ? aggregate.total / aggregate.count : null
        }

        series.push(point)
    }

    return {
        providers: providerKeys,
        points: series,
    }
}

function getRecentRunsByPeriod(runs, period) {
    const cutoff = getPeriodCutoff(period, runs)
    return [...runs]
        .filter((run) => {
            const createdAt = new Date(run.created_at)
            return Number.isNaN(createdAt.getTime()) ? false : createdAt >= cutoff
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
}

function getProviderKey(run) {
    return run.provider || 'unknown'
}

function formatProviderLabel(provider) {
    if (!provider) return 'Unknown'
    return provider.charAt(0).toUpperCase() + provider.slice(1)
}

const trendColors = ['#22c55e', '#6366f1', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7', '#14b8a6']

function getTrendConfig(period, cutoff, runs) {
    const now = new Date()
    const normalizedNow = new Date(now)
    normalizedNow.setMinutes(0, 0, 0)

    if (period === '24h') {
        const start = new Date(now)
        start.setHours(start.getHours() - 23)
        start.setMinutes(0, 0, 0)
        return { start, end: normalizedNow, stepMs: 60 * 60 * 1000 }
    }

    if (period === '7d') {
        const start = new Date(cutoff)
        start.setHours(0, 0, 0, 0)
        const end = new Date(now)
        end.setHours(0, 0, 0, 0)
        return { start, end, stepMs: 24 * 60 * 60 * 1000 }
    }

    if (period === '1m') {
        const start = new Date(cutoff)
        start.setHours(0, 0, 0, 0)
        const end = new Date(now)
        end.setHours(0, 0, 0, 0)
        return { start, end, stepMs: 24 * 60 * 60 * 1000 }
    }

    if (period === '3m') {
        const start = new Date(cutoff)
        start.setHours(0, 0, 0, 0)
        const end = new Date(now)
        end.setHours(0, 0, 0, 0)
        return { start, end, stepMs: 7 * 24 * 60 * 60 * 1000 }
    }

    const earliestRun = runs.reduce((earliest, run) => {
        const createdAt = new Date(run.created_at)
        if (Number.isNaN(createdAt.getTime())) return earliest
        if (!earliest || createdAt < earliest) return createdAt
        return earliest
    }, null)

    const start = new Date(earliestRun || cutoff)
    start.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setHours(0, 0, 0, 0)
    return { start, end, stepMs: 7 * 24 * 60 * 60 * 1000 }
}

function getBucketStart(date, config) {
    const bucket = new Date(date)
    if (config.stepMs === 60 * 60 * 1000) {
        bucket.setMinutes(0, 0, 0)
        return bucket
    }

    bucket.setHours(0, 0, 0, 0)
    if (config.stepMs === 7 * 24 * 60 * 60 * 1000) {
        const day = bucket.getDay()
        const diff = (day + 6) % 7
        bucket.setDate(bucket.getDate() - diff)
    }
    return bucket
}

function addTimeStep(date, stepMs) {
    return new Date(date.getTime() + stepMs)
}

function formatTrendLabel(date, period, stepMs) {
    if (stepMs === 60 * 60 * 1000) {
        return date.toLocaleTimeString(undefined, { hour: 'numeric' })
    }

    if (stepMs === 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    if (period === 'all') {
        return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
    }

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getPeriodCutoff(period, runs = []) {
    const now = new Date()
    const cutoff = new Date(now)

    if (period === 'all') {
        const earliestRun = runs.reduce((earliest, run) => {
            const createdAt = new Date(run.created_at)
            if (Number.isNaN(createdAt.getTime())) return earliest
            if (!earliest || createdAt < earliest) return createdAt
            return earliest
        }, null)

        if (earliestRun) {
            const normalized = new Date(earliestRun)
            normalized.setHours(0, 0, 0, 0)
            return normalized
        }

        cutoff.setDate(cutoff.getDate() - 6)
        cutoff.setHours(0, 0, 0, 0)
        return cutoff
    }

    if (period === '24h') {
        cutoff.setHours(cutoff.getHours() - 24)
        return cutoff
    }

    if (period === '7d') {
        cutoff.setDate(cutoff.getDate() - 6)
        cutoff.setHours(0, 0, 0, 0)
        return cutoff
    }

    if (period === '1m') {
        cutoff.setDate(cutoff.getDate() - 29)
        cutoff.setHours(0, 0, 0, 0)
        return cutoff
    }

    if (period === '3m') {
        cutoff.setDate(cutoff.getDate() - 89)
        cutoff.setHours(0, 0, 0, 0)
        return cutoff
    }

    cutoff.setDate(cutoff.getDate() - 6)
    cutoff.setHours(0, 0, 0, 0)
    return cutoff
}
