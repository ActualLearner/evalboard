import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { parseCsvToItems } from '../utils/csv'
import { getErrorMessage } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import Card from '../components/ui/Card'

export default function NewDatasetPage() {
    const [name, setName] = useState('')
    const [rows, setRows] = useState([{ input: '', ideal_output: '' }])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const fileRef = useRef(null)
    const navigate = useNavigate()

    const updateRow = (index, key, value) => {
        setRows((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], [key]: value }
            return next
        })
    }

    const addRow = () => setRows((prev) => [...prev, { input: '', ideal_output: '' }])

    const removeRow = (index) => {
        setRows((prev) => {
            const next = prev.filter((_, i) => i !== index)
            return next.length > 0 ? next : [{ input: '', ideal_output: '' }]
        })
    }

    const importCsv = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const text = await file.text()
            const parsed = parseCsvToItems(text)
            setRows(parsed.length > 0 ? parsed : [{ input: '', ideal_output: '' }])
            setError('')
        } catch (err) {
            setError(err.message || 'Failed to parse CSV.')
        }
    }

    const saveDataset = async () => {
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
            await api.post('/api/datasets/', { name: name.trim(), items })
            navigate('/datasets')
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to save dataset.'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">New Dataset</h1>
            {error ? <InlineError message={error} /> : null}

            <Card>
                <label className="mb-1 block text-[16px] font-medium text-slate-500">Dataset name</label>
                <input
                    className="w-full rounded-lg border border-[#d3dae3] bg-[#fbfcfd] px-3 py-2 text-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dataset name"
                />

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-170 w-full border-collapse text-base">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Input</th>
                                <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Ideal Output</th>
                                <th className="border-b border-[#d8dee6] px-2 py-2 font-medium">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index} className="border-b border-[#e4e9f0]">
                                    <td className="px-2 py-2">
                                        <input
                                            className="w-full rounded-md border border-[#d3dae3] bg-[#fbfcfd] px-2 py-1"
                                            value={row.input}
                                            onChange={(e) => updateRow(index, 'input', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            className="w-full rounded-md border border-[#d3dae3] bg-[#fbfcfd] px-2 py-1"
                                            value={row.ideal_output}
                                            onChange={(e) => updateRow(index, 'ideal_output', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <button
                                            className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-sm text-rose-700"
                                            onClick={() => removeRow(index)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        className="rounded-lg border border-[#d3dae3] bg-[#fbfcfd] px-3 py-2 text-base font-semibold text-slate-700 hover:bg-[#eef2f7]"
                        onClick={addRow}
                    >
                        Add Row
                    </button>

                    <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} />
                    <button
                        className="rounded-lg border border-[#d3dae3] bg-[#fbfcfd] px-3 py-2 text-base font-semibold text-slate-700 hover:bg-[#eef2f7]"
                        onClick={() => fileRef.current?.click()}
                    >
                        Import CSV
                    </button>

                    <button
                        className="ml-auto rounded-lg bg-[#3a6fb2] px-4 py-2 text-base font-semibold text-[#f5f8fc] hover:bg-[#325f99] disabled:opacity-60"
                        onClick={saveDataset}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Dataset'}
                    </button>
                </div>
            </Card>
        </div>
    )
}
