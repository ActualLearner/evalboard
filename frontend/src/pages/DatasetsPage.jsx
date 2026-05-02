import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { formatDateTime, getErrorMessage } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import Card from '../components/ui/Card'

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const highlightId = searchParams.get('highlight')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    api
      .get('/api/datasets/')
      .then(({ data }) => {
        if (!active) return
        setDatasets(data)
      })
      .catch((err) => {
        if (!active) return
        setError(getErrorMessage(err, 'Failed to load datasets.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const deleteDataset = async (id) => {
    if (!window.confirm('Delete this dataset?')) return

    try {
      await api.delete(`/api/datasets/${id}/`)
      setDatasets((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete dataset.'))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>Datasets</h1>
        <Link
          to="/datasets/new"
          className="rounded-lg border border-[#d3dae3] bg-[#fbfcfd] px-3 py-2 text-base font-semibold text-slate-700 hover:bg-[#eef2f7]"
        >
          New Dataset
        </Link>
      </div>

      {error ? <InlineError message={error} /> : null}

      {loading ? (
        <Card><p className="text-base text-slate-500">Loading datasets...</p></Card>
      ) : (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {datasets.map((d) => (
            <Card key={d.id} className={highlightId && String(d.id) === highlightId ? 'ring-2 ring-[#7bc5e6]' : ''}>
              <h2 className="text-[20px] font-light text-slate-800">{d.name}</h2>
              <p className="mt-2 text-[16px] text-slate-500">Rows: {d.items?.length || 0}</p>
              <p className="mt-1 text-[16px] text-slate-500">Created: {formatDateTime(d.created_at)}</p>
              <div className="mt-4 flex gap-2">
                <button
                  className="rounded-lg border border-[#d3dae3] bg-[#fbfcfd] px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eef2f7]"
                  onClick={() => navigate(`/datasets/${d.id}`)}
                >
                  Edit
                </button>
                <button
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  onClick={() => deleteDataset(d.id)}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
          {datasets.length === 0 && (
            <Card><p className="text-base text-slate-500">No datasets found.</p></Card>
          )}
        </section>
      )}
    </div>
  )
}
