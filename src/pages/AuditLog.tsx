import { useEffect, useState } from 'react'
import client from '../api/client'
import type { AuditLog as AuditLogEntry, Paginated } from '../api/types'
import Pagination from '../components/Pagination'

const ENTITY_TYPES = ['Batch', 'BatchMortality', 'BatchWeight', 'FeedPurchase', 'FeedConsumption', 'HealthRecord', 'Customer', 'Order', 'Expense', 'InventoryItem'] as const
const ACTIONS = ['created', 'updated', 'deleted', 'corrected'] as const

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => setPage(1), [entityType, action])

  useEffect(() => {
    setLoading(true)
    client
      .get<Paginated<AuditLogEntry>>('/audit-log', { params: { entity_type: entityType || undefined, action: action || undefined, page } })
      .then((res) => {
        setLogs(res.data.data)
        setMeta(res.data.meta)
      })
      .finally(() => setLoading(false))
  }, [entityType, action, page])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Audit Log</h1>

      <div className="flex gap-3 items-end bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Entity</label>
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All</option>
            {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Action</label>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a[0].toUpperCase() + a.slice(1)}</option>)}
          </select>
        </div>
        {(entityType || action) && (
          <button onClick={() => { setEntityType(''); setAction('') }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800">
            Clear
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Entity</th>
              <th className="px-4 py-2">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No audit events match your filters.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{log.user?.name ?? 'System'}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{log.action}</span>
                  </td>
                  <td className="px-4 py-2">{log.entity_type} #{log.entity_id}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{log.reason ?? '—'}</td>
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
