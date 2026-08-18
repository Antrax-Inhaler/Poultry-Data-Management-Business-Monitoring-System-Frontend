import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import type { Batch, Paginated } from '../api/types'
import { BATCH_STATUSES } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useSelection } from '../hooks/useSelection'
import Pagination from '../components/Pagination'
import BulkActionsBar from '../components/BulkActionsBar'
import ImportExportBar from '../components/ImportExportBar'

export default function BatchList() {
  const { can } = useAuth()
  const [batches, setBatches] = useState<Batch[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebouncedValue(search)
  const { selected, toggle, toggleAll, clear, isSelected } = useSelection()

  useEffect(() => setPage(1), [status, debouncedSearch])

  function reload() {
    setLoading(true)
    client
      .get<Paginated<Batch>>('/batches', { params: { status: status || undefined, search: debouncedSearch || undefined, page } })
      .then((res) => {
        setBatches(res.data.data)
        setMeta(res.data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(reload, [status, debouncedSearch, page])

  const canManage = can('batches.manage')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Batches</h1>
        {canManage && (
          <Link to="/batches/new" className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700">
            + New Batch
          </Link>
        )}
      </div>

      {canManage && <ImportExportBar exportEndpoint="/batches/export" importEndpoint="/batches/import" requiresDataSource onImported={reload} />}

      <div className="flex gap-3 items-end bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search batch code</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-md border-gray-300 text-sm" placeholder="e.g. BATCH-001" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All statuses</option>
            {BATCH_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {(status || search) && (
          <button onClick={() => { setStatus(''); setSearch('') }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800">
            Clear
          </button>
        )}
      </div>

      {canManage && (
        <BulkActionsBar
          endpoint="/batches/bulk"
          selectedIds={[...selected]}
          label="batch(es)"
          onDone={() => { clear(); reload() }}
        />
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              {canManage && (
                <th className="px-4 py-2 w-8">
                  <input type="checkbox" checked={batches.length > 0 && batches.every((b) => isSelected(b.id))} onChange={() => toggleAll(batches.map((b) => b.id))} className="rounded border-gray-300" />
                </th>
              )}
              <th className="px-4 py-2">Batch Code</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Alive</th>
              <th className="px-4 py-2">Mortality %</th>
              <th className="px-4 py-2">FCR</th>
              <th className="px-4 py-2">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No batches match your filters.</td></tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id} className={isSelected(b.id) ? 'bg-indigo-50' : ''}>
                  {canManage && (
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={isSelected(b.id)} onChange={() => toggle(b.id)} className="rounded border-gray-300" />
                    </td>
                  )}
                  <td className="px-4 py-2">
                    <Link to={`/batches/${b.id}`} className="text-indigo-600 hover:underline">{b.batch_code}</Link>
                  </td>
                  <td className="px-4 py-2">{b.status}</td>
                  <td className="px-4 py-2">{b.age_in_days ?? '—'}</td>
                  <td className="px-4 py-2">{b.current_quantity.toLocaleString()}</td>
                  <td className="px-4 py-2">{b.mortality_rate}%</td>
                  <td className="px-4 py-2">{b.fcr > 0 ? b.fcr : '—'}</td>
                  <td className={`px-4 py-2 ${b.gross_margin < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₱{b.gross_margin.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  )
}
