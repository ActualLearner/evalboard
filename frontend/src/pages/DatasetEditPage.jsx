import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { getErrorMessage } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import DatasetEditor from '../components/datasets/DatasetEditor'

export default function DatasetEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [rows, setRows] = useState([{ input: '', ideal_output: '' }])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [deleteState, setDeleteState] = useState({ open: false, pending: false })

    useEffect(() => {
        let active = true
        setLoading(true)
        setError('')

        api
            .get(`/api/datasets/${id}/`)
            .then(({ data }) => {
                if (!active) return
                setName(data.name || '')
                setRows(normalizeItems(data.items || []))
            })
            .catch((err) => {
                if (!active) return
                setError(getErrorMessage(err, 'Failed to load dataset.'))
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [id])

    const topRightAction = useMemo(() => {
        return (
            <button
                type="button"
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                onClick={() => setDeleteState((prev) => ({ ...prev, open: true }))}
            >
                Delete Dataset
            </button>
        )
    }, [])

    const saveChanges = async () => {
        const items = rows
            .map((r) => ({ input: r.input.trim(), ideal_output: r.ideal_output.trim() }))
            .filter((r) => r.input || r.ideal_output)

        if (!name.trim()) {
            setError('Dataset name is required.')
            return
        }
        if (items.length === 0) {
            setError('Please add at least one dataset row.')
            return
        }

        setSaving(true)
        setError('')
        try {
            await api.put(`/api/datasets/${id}/`, { name: name.trim(), items })
            navigate('/datasets')
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to save dataset changes.'))
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        setDeleteState((prev) => ({ ...prev, pending: true }))
        setError('')
        try {
            await api.delete(`/api/datasets/${id}/`)
            navigate('/datasets')
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete dataset.'))
            setDeleteState({ open: false, pending: false })
        }
    }

    if (loading) {
        return <div className="space-y-3"><p className="text-base text-slate-500">Loading dataset...</p></div>
    }

    return (
        <div className="space-y-3">
            <Link to="/datasets" className="inline-flex text-base font-medium text-slate-700 hover:text-slate-900">
                ← Back to Datasets
            </Link>

            <DatasetEditor
                title="Edit Dataset"
                name={name}
                setName={setName}
                rows={rows}
                setRows={setRows}
                onSave={saveChanges}
                saveLabel="Save Changes"
                saving={saving}
                error={error}
                setError={setError}
                topRightAction={topRightAction}
                saveRowClassName="ml-auto rounded-lg bg-[#3a6fb2] px-4 py-2 text-base font-semibold text-[#f5f8fc] hover:bg-[#325f99] disabled:opacity-60"
            />

            {deleteState.open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-[#d7dde5] bg-white p-5 shadow-xl">
                        <h2 className="text-xl font-semibold text-slate-900">Delete Dataset?</h2>
                        <p className="mt-2 text-base leading-relaxed text-slate-600">
                            Are you sure? This will permanently delete this dataset and cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="rounded-lg border border-[#d3dae3] bg-[#fbfcfd] px-4 py-2 text-base font-semibold text-slate-700 hover:bg-[#eef2f7]"
                                onClick={() => !deleteState.pending && setDeleteState({ open: false, pending: false })}
                                disabled={deleteState.pending}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="rounded-lg bg-rose-600 px-4 py-2 text-base font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                                onClick={confirmDelete}
                                disabled={deleteState.pending}
                            >
                                {deleteState.pending ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

function normalizeItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return [{ input: '', ideal_output: '' }]
    }

    return items.map((item) => ({
        input: item.input ?? '',
        ideal_output: item.ideal_output ?? '',
    }))
}
