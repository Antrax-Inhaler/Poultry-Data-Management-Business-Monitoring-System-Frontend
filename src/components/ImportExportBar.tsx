import { useState, type ChangeEvent } from 'react'
import client from '../api/client'

export default function ImportExportBar({
  exportEndpoint,
  importEndpoint,
  requiresDataSource = false,
  onImported,
}: {
  exportEndpoint: string
  importEndpoint?: string
  requiresDataSource?: boolean
  onImported?: () => void
}) {
  const [showImport, setShowImport] = useState(false)
  const [dataSource, setDataSource] = useState('HISTORICAL_ACTUAL')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null)

  async function handleExport() {
    setBusy(true)
    try {
      const res = await client.get(exportEndpoint, { responseType: 'blob' })
      const disposition: string = res.headers['content-disposition'] ?? ''
      const match = disposition.match(/filename="?([^"]+)"?/)
      const filename = match ? match[1] : 'export.csv'

      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  async function handleImport() {
    if (!file || !importEndpoint) return
    setBusy(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      if (requiresDataSource) form.append('data_source', dataSource)

      const res = await client.post(importEndpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      if (res.data.created > 0) onImported?.()
    } catch (err: any) {
      setResult({ created: 0, errors: [err.response?.data?.message ?? 'Import failed.'] })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={handleExport} disabled={busy} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          Export CSV
        </button>
        {importEndpoint && (
          <button onClick={() => setShowImport((s) => !s)} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            {showImport ? 'Cancel Import' : 'Import CSV'}
          </button>
        )}
      </div>

      {showImport && importEndpoint && (
        <div className="bg-white shadow-sm rounded-lg p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">CSV File</label>
            <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="text-sm" />
          </div>
          {requiresDataSource && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">These records are</label>
              <select value={dataSource} onChange={(e) => setDataSource(e.target.value)} className="rounded-md border-gray-300 text-sm">
                <option value="HISTORICAL_ACTUAL">Actual historical records</option>
                <option value="HISTORICAL_ESTIMATE">Estimated historical records</option>
              </select>
            </div>
          )}
          <button onClick={handleImport} disabled={!file || busy} className="px-4 py-1.5 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
            {busy ? 'Importing…' : 'Upload'}
          </button>
        </div>
      )}

      {result && (
        <div className={`text-sm rounded-md p-3 border ${result.errors.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <div>{result.created} record(s) imported.</div>
          {result.errors.length > 0 && (
            <ul className="mt-1 list-disc list-inside text-xs">
              {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
              {result.errors.length > 10 && <li>…and {result.errors.length - 10} more.</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
