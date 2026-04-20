import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { getErrorMessage } from '../utils/format'
import DatasetEditor from '../components/datasets/DatasetEditor'

export default function NewDatasetPage() {
    const [name, setName] = useState('')
    const [rows, setRows] = useState([{ input: '', ideal_output: '' }])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

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
        <DatasetEditor
            title="New Dataset"
            name={name}
            setName={setName}
            rows={rows}
            setRows={setRows}
            onSave={saveDataset}
            saveLabel="Save Dataset"
            saving={saving}
            error={error}
            setError={setError}
        />
    )
}
