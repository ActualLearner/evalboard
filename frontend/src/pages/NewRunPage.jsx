import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { geminiApiKeyRequiredModels, providerModels } from '../constants/providerModels'
import { parseCsvToItems } from '../utils/csv'
import { getErrorMessage } from '../utils/format'
import InlineError from '../components/ui/InlineError'
import Card from '../components/ui/Card'
import ScrollableSelect from '../components/ui/ScrollableSelect'

export default function NewRunPage() {
  const [datasets, setDatasets] = useState([])
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedPromptId, setSelectedPromptId] = useState('')
  const [promptTemplate, setPromptTemplate] = useState('')
  const [provider, setProvider] = useState('groq')
  const [model, setModel] = useState(providerModels.groq[0])
  const [temperature, setTemperature] = useState(0.7)
  const [datasetId, setDatasetId] = useState('')
  const [providerKeys, setProviderKeys] = useState(() => {
    try {
      const raw = localStorage.getItem('evalboard_provider_keys')
      return raw ? JSON.parse(raw) : { groq: '', anthropic: '', gemini: '', deepseek: '', openai: '' }
    } catch {
      return { groq: '', anthropic: '', gemini: '', deepseek: '', openai: '' }
    }
  })

  const [importRows, setImportRows] = useState([])
  const [importName, setImportName] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [savingImport, setSavingImport] = useState(false)
  const [running, setRunning] = useState(false)

  const csvInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    Promise.all([api.get('/api/datasets/'), api.get('/api/prompts/')])
      .then(([datasetsRes, promptsRes]) => {
        if (!active) return
        setDatasets(datasetsRes.data)
        setPrompts(promptsRes.data)
        if (datasetsRes.data.length > 0) setDatasetId(String(datasetsRes.data[0].id))
      })
      .catch((err) => {
        if (!active) return
        setError(getErrorMessage(err, 'Failed to load datasets/prompts.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('evalboard_provider_keys', JSON.stringify(providerKeys))
  }, [providerKeys])

  useEffect(() => {
    const models = providerModels[provider]
    if (!models.includes(model)) {
      setModel(models[0])
    }
  }, [provider, model])

  const selectedDataset = datasets.find((d) => String(d.id) === String(datasetId))
  const currentProviderKey = providerKeys[provider] || ''
  const requiresApiKey = provider === 'openai' || provider === 'anthropic' || (provider === 'gemini' && geminiApiKeyRequiredModels.has(model))
  const isSavedPromptSelected = selectedPromptId !== ''
  const canSelectSavedPrompt = isSavedPromptSelected || promptTemplate.trim().length === 0

  const handlePromptSelect = (id) => {
    setSelectedPromptId(id)
    if (id === '') {
      setPromptTemplate('')
      return
    }
    const chosen = prompts.find((p) => String(p.id) === id)
    if (chosen) setPromptTemplate(chosen.template)
  }

  const handleCsvPick = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const rows = parseCsvToItems(text)
      setImportRows(rows)
      setImportName(file.name.replace(/\.csv$/i, '') || 'Imported Dataset')
      setSubmitError('')
    } catch (err) {
      setSubmitError(err.message || 'Failed to parse CSV.')
    }
  }

  const saveImportedDataset = async () => {
    if (!importName.trim()) {
      setSubmitError('Please provide a dataset name for imported CSV rows.')
      return
    }
    if (importRows.length === 0) {
      setSubmitError('No parsed rows to save.')
      return
    }

    setSavingImport(true)
    setSubmitError('')
    try {
      const { data } = await api.post('/api/datasets/', { name: importName.trim(), items: importRows })
      setDatasets((prev) => [data, ...prev])
      setDatasetId(String(data.id))
      setImportRows([])
      setImportName('')
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to save imported dataset.'))
    } finally {
      setSavingImport(false)
    }
  }

  const runEval = async () => {
    setSubmitError('')

    if (!datasetId) {
      setSubmitError('Please select a dataset.')
      return
    }
    if (!promptTemplate.includes('{{input}}')) {
      setSubmitError('Prompt template must contain {{input}}.')
      return
    }
    if (requiresApiKey && !currentProviderKey.trim()) {
      setSubmitError(`${provider.toUpperCase()} ${model} requires your API key.`)
      return
    }

    setRunning(true)
    try {
      const headers = {}
      if (currentProviderKey.trim()) headers['X-API-Key'] = currentProviderKey.trim()

      const payload = {
        dataset: Number(datasetId),
        prompt_template: promptTemplate,
        provider,
        model,
        temperature: Number(temperature),
      }

      const { data } = await api.post('/api/runs/', payload, { headers })
      navigate(`/runs/${data.id}`)
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to run evaluation.'))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>New Run</h1>
      {error ? <InlineError message={error} /> : null}

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card>
          <h2 className="text-[20px] font-light" style={{ color: 'var(--muted-foreground)' }}>Model & Prompt</h2>

          {loading ? (
            <p className="mt-4 text-base text-slate-500">Loading prompt options...</p>
          ) : (
            <>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-[16px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Load saved prompt</label>
                  <ScrollableSelect
                    options={[
                      { value: '', label: 'Select prompt (optional)' },
                      ...prompts.map((p) => ({ value: String(p.id), label: p.name })),
                    ]}
                    value={selectedPromptId}
                    onChange={handlePromptSelect}
                    placeholder="Select prompt (optional)"
                    disabled={!canSelectSavedPrompt}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[16px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Prompt template</label>
                  <textarea
                    className={[
                      'min-h-36 w-full rounded-lg border px-3 py-2 text-base',
                      isSavedPromptSelected
                        ? 'cursor-not-allowed border-[#d6dde6] bg-[#f2f5f8] text-slate-500'
                        : 'border-[#d3dae3] bg-[#fbfcfd]',
                    ].join(' ')}
                    value={promptTemplate}
                    onChange={(e) => setPromptTemplate(e.target.value)}
                    disabled={isSavedPromptSelected}
                  />
                  <p className="mt-1 text-[16px] text-slate-500">Use {'{{input}}'} as the placeholder for each dataset row&apos;s input.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[16px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Provider</label>
                    <ScrollableSelect
                      options={[
                        { value: 'groq', label: 'Groq' },
                        { value: 'anthropic', label: 'Anthropic' },
                        { value: 'gemini', label: 'Gemini' },
                        { value: 'deepseek', label: 'DeepSeek' },
                        { value: 'openai', label: 'OpenAI' },
                      ]}
                      value={provider}
                      onChange={setProvider}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[16px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Model</label>
                    <ScrollableSelect
                      options={providerModels[provider]}
                      value={model}
                      onChange={setModel}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[16px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Temperature: {Number(temperature).toFixed(1)}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div
                  className={[
                    'rounded-lg p-3',
                    requiresApiKey
                      ? 'border border-yellow-200 bg-yellow-50'
                      : 'border border-[#d3dae3] bg-[#fbfcfd]',
                  ].join(' ')}
                >
                  <p
                    className={[
                      'text-[16px] font-medium',
                      requiresApiKey ? 'text-yellow-700' : 'text-slate-600',
                    ].join(' ')}
                  >
                    {requiresApiKey
                      ? `${provider.toUpperCase()} ${model} requires your API key before running.`
                      : `Optional: provide your ${provider} API key.`}
                  </p>
                  <input
                    type="text"
                    className={[
                      'mt-2 w-full field-input',
                      requiresApiKey ? 'border-yellow-300' : '',
                    ].join(' ')}
                    placeholder={`Paste your ${provider} API key`}
                    value={currentProviderKey}
                    onChange={(e) =>
                      setProviderKeys((prev) => ({
                        ...prev,
                        [provider]: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-[20px] font-light" style={{ color: 'var(--muted-foreground)' }}>Dataset</h2>

          {loading ? (
            <p className="mt-4 text-base text-slate-500">Loading datasets...</p>
          ) : (
            <>
              <div className="mt-4">
                <label className="mb-1 block text-[16px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Select dataset</label>
                <ScrollableSelect
                  options={[
                    { value: '', label: 'Select a dataset' },
                    ...datasets.map((d) => ({ value: String(d.id), label: d.name })),
                  ]}
                  value={datasetId}
                  onChange={setDatasetId}
                  placeholder="Select a dataset"
                />
              </div>

              <div className="mt-4">
                <p className="mb-1 text-[16px] font-medium text-slate-500">Preview (max 8 rows)</p>
                <div className="max-h-72 overflow-auto rounded-lg border border-[#d3dae3] bg-[#fbfcfd]">
                  <table className="w-full text-[16px]">
                    <thead>
                      <tr className="bg-[#eef2f7] text-left text-slate-500">
                        <th className="px-2 py-2 font-medium bg-white">Input</th>
                        <th className="px-2 py-2 font-medium bg-white">Ideal Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedDataset?.items || []).slice(0, 8).map((item) => (
                        <tr key={item.id} className="border-t border-[#e2e8f0] text-slate-700">
                          <td className="px-2 py-2 align-top">{item.input}</td>
                          <td className="px-2 py-2 align-top">{item.ideal_output}</td>
                        </tr>
                      ))}
                      {(selectedDataset?.items || []).length === 0 && (
                        <tr>
                          <td colSpan={2} className="px-2 py-4 text-center text-slate-500">No dataset selected.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#d3dae3] bg-[#fbfcfd] p-3">
                <p className="text-[16px] font-medium text-slate-500">Import CSV</p>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleCsvPick}
                />
                <button
                  className="mt-2 rounded-lg border border-[#d3dae3] bg-white px-3 py-2 text-sm font-medium hover:bg-[#eef2f7]"
                  onClick={() => csvInputRef.current?.click()}
                >
                  Choose CSV
                </button>

                {importRows.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-slate-600">Parsed {importRows.length} row(s).</p>
                    <input
                      className="w-full field-input"
                      placeholder="Dataset name"
                      value={importName}
                      onChange={(e) => setImportName(e.target.value)}
                    />
                    <button
                      className="w-full rounded-lg bg-[#3a6fb2] px-3 py-2 text-base font-medium text-[#f5f8fc] hover:bg-[#325f99] disabled:opacity-60"
                      onClick={saveImportedDataset}
                      disabled={savingImport}
                    >
                      {savingImport ? 'Saving...' : 'Save & Use'}
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </Card>
      </section>

      {submitError ? <InlineError message={submitError} /> : null}

      <button
        className="w-full rounded-xl bg-[#3a6fb2] px-4 py-3 text-base font-semibold text-[#f5f8fc] hover:bg-[#325f99] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={runEval}
        disabled={running || loading}
      >
        {running ? 'Running Eval...' : 'Run Eval'}
      </button>
    </div>
  )
}
