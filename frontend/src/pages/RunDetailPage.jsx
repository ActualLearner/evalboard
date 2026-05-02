import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { formatDateTime, formatMs, getErrorMessage } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import Card from '../components/ui/Card'
import SummaryPill from '../components/ui/SummaryPill'
import ScoreBadge from '../components/ui/ScoreBadge'

export default function RunDetailPage() {
  const { id } = useParams()
  const [run, setRun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    api
      .get(`/api/runs/${id}/`)
      .then(({ data }) => {
        if (!active) return
        setRun(data)
      })
      .catch((err) => {
        if (!active) return
        setError(getErrorMessage(err, 'Failed to load run detail.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  return (
    <div className="space-y-3">
      <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>Run Details</h1>
      {error ? <InlineError message={error} /> : null}

      {loading ? (
        <Card><p className="text-base text-slate-500">Loading run...</p></Card>
      ) : run ? (
        <>
          <Card>
            <div className="grid grid-cols-2 gap-2 text-base md:grid-cols-4 xl:grid-cols-8">
              <SummaryPill label="Model" value={run.model} />
              <SummaryPill label="Provider" value={run.provider} />
              <SummaryPill label="Temperature" value={String(run.temperature)} />
              <SummaryPill label="Avg Score" value={Number(run.avg_score || 0).toFixed(3)} />
              <SummaryPill label="Total Items" value={String(run.total_items)} />
              <SummaryPill label="Failed Items" value={String(run.failed_items)} />
              <SummaryPill label="Latency" value={formatMs(run.latency_ms)} />
              <SummaryPill label="Date" value={formatDateTime(run.created_at)} />
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-245 w-full border-collapse text-base">
                <thead>
                  <tr className="text-left text-slate-500">
                    {['Input', 'Ideal Output', 'Model Output', 'Score', 'Latency (ms)'].map((h) => (
                      <th key={h} className="border-b border-[#d8dee6] px-3 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(run.results || []).map((r) => (
                    <tr
                      key={r.id}
                      className={[
                        'border-b border-[#e4e9f0] text-slate-700',
                        Number(r.score) === 0 ? 'bg-rose-50/60' : '',
                      ].join(' ')}
                    >
                      <td className="px-3 py-2 align-top">{r.dataset_item?.input}</td>
                      <td className="px-3 py-2 align-top">{r.dataset_item?.ideal_output}</td>
                      <td className="px-3 py-2 align-top">{r.model_output}</td>
                      <td className="px-3 py-2 align-top">
                        <ScoreBadge score={Number(r.score)} />
                      </td>
                      <td className="px-3 py-2 align-top">{formatMs(r.latency_ms)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}
