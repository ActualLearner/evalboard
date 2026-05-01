import { useEffect, useState } from 'react'
import api from '../api/client'
import { formatDateTime, getErrorMessage } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import Card from '../components/ui/Card'

export default function PromptsPage() {
    const [prompts, setPrompts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [name, setName] = useState('')
    const [template, setTemplate] = useState('')
    const [expanded, setExpanded] = useState(new Set())
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let active = true
        setLoading(true)
        setError('')

        api
            .get('/api/prompts/')
            .then(({ data }) => {
                if (!active) return
                setPrompts(data)
            })
            .catch((err) => {
                if (!active) return
                setError(getErrorMessage(err, 'Failed to load prompts.'))
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const createPrompt = async () => {
        if (!name.trim() || !template.trim()) {
            setError('Name and template are required.')
            return
        }

        setSaving(true)
        setError('')
        try {
            const { data } = await api.post('/api/prompts/', { name: name.trim(), template: template.trim() })
            setPrompts((prev) => [data, ...prev])
            setName('')
            setTemplate('')
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to save prompt.'))
        } finally {
            setSaving(false)
        }
    }

    const deletePrompt = async (id) => {
        try {
            await api.delete(`/api/prompts/${id}/`)
            setPrompts((prev) => prev.filter((p) => p.id !== id))
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete prompt.'))
        }
    }

    const toggle = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Prompts</h1>
            {error ? <InlineError message={error} /> : null}

            <Card>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[minmax(220px,320px)_auto] md:justify-between">
                        <div>
                            <label className="mb-1 block text-[16px] font-medium text-slate-600">Prompt name</label>
                            <input
                                className="w-full rounded-lg border border-[#d3dae3] bg-[#fbfcfd] px-3 py-2 text-base"
                                placeholder="Prompt name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <button
                            className="h-10 self-end rounded-lg bg-[#3a6fb2] px-4 text-base font-semibold text-[#f5f8fc] hover:bg-[#325f99] disabled:opacity-60"
                            onClick={createPrompt}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Prompt'}
                        </button>
                    </div>

                    <div>
                        <label className="mb-1 block text-[16px] font-medium text-slate-600">Template</label>
                        <textarea
                            className="min-h-28 w-full max-h-80 resize-y rounded-lg border border-[#d3dae3] bg-[#fbfcfd] px-3 py-2 text-base"
                            placeholder="Template"
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                        />
                        <p className="mt-1 text-[16px] text-slate-500">Tip: include {'{{input}}'} where dataset row input should be inserted.</p>
                    </div>
                </div>
            </Card>

            {loading ? (
                <Card><p className="text-base text-slate-500">Loading prompts...</p></Card>
            ) : (
                <div className="space-y-3">
                    {prompts.map((p) => {
                        const open = expanded.has(p.id)
                        return (
                            <Card key={p.id}>
                                <div className="flex items-start justify-between gap-3">
                                    <button className="min-w-0 flex-1 text-left" onClick={() => toggle(p.id)}>
                                        <p className="text-base font-semibold text-slate-600">{p.name}</p>
                                        <p className="mt-1 text-[16px] text-slate-500">{formatDateTime(p.created_at)}</p>
                                        <p className={['mt-2 text-base text-slate-700', open ? 'whitespace-pre-wrap' : 'truncate'].join(' ')}>
                                            {p.template}
                                        </p>
                                    </button>
                                    <button
                                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                                        onClick={() => deletePrompt(p.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Card>
                        )
                    })}
                    {prompts.length === 0 && <Card><p className="text-base text-slate-500">No prompts saved yet.</p></Card>}
                </div>
            )}
        </div>
    )
}
