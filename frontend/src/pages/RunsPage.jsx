import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { formatDateTime, formatMs, getErrorMessage, scoreTextClass } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import Card from '../components/ui/Card'

export default function RunsPage() {
    const [runs, setRuns] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        let active = true
        setLoading(true)
        setError('')

        api
            .get('/api/runs/')
            .then(({ data }) => {
                if (!active) return
                const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                setRuns(sorted)
            })
            .catch((err) => {
                if (!active) return
                setError(getErrorMessage(err, 'Failed to load runs.'))
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    return (
        <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Runs</h1>
            {error ? <InlineError message={error} /> : null}

            <Card>
                {loading ? (
                    <p className="text-base text-slate-500">Loading runs...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-245 w-full border-collapse text-base">
                            <thead>
                                <tr className="text-left text-slate-500">
                                    {['Dataset ID', 'Provider', 'Model', 'Avg Score', 'Total Items', 'Failed Items', 'Latency (ms)', 'Date Created', 'Actions'].map((h) => (
                                        <th key={h} className="border-b border-[#d8dee6] px-3 py-2 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {runs.map((run) => (
                                    <tr key={run.id} className="border-b border-[#e4e9f0] text-slate-700">
                                        <td className="px-3 py-2">{run.dataset}</td>
                                        <td className="px-3 py-2">{run.provider}</td>
                                        <td className="px-3 py-2">{run.model}</td>
                                        <td className="px-3 py-2">
                                            <span className={scoreTextClass(run.avg_score)}>{Number(run.avg_score ?? 0).toFixed(3)}</span>
                                        </td>
                                        <td className="px-3 py-2">{run.total_items}</td>
                                        <td className="px-3 py-2">{run.failed_items}</td>
                                        <td className="px-3 py-2">{formatMs(run.latency_ms)}</td>
                                        <td className="px-3 py-2">{formatDateTime(run.created_at)}</td>
                                        <td className="px-3 py-2">
                                            <button
                                                className="rounded-md border border-[#d3dae3] bg-[#fbfcfd] px-3 py-1 text-sm font-medium hover:bg-[#eef3f8]"
                                                onClick={() => navigate(`/runs/${run.id}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {runs.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-3 py-6 text-center text-slate-500">No runs yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}
