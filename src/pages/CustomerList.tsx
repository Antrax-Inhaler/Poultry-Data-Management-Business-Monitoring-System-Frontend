import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import type { Customer, Paginated } from '../api/types'
import { CUSTOMER_TYPES } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useSelection } from '../hooks/useSelection'
import Pagination from '../components/Pagination'
import BulkActionsBar from '../components/BulkActionsBar'
import ImportExportBar from '../components/ImportExportBar'

export default function CustomerList() {
  const { can } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebouncedValue(search)
  const { selected, toggle, toggleAll, clear, isSelected } = useSelection()

  useEffect(() => setPage(1), [type, debouncedSearch])

  function reload() {
    setLoading(true)
    client
      .get<Paginated<Customer>>('/customers', { params: { type: type || undefined, search: debouncedSearch || undefined, page } })
      .then((res) => {
        setCustomers(res.data.data)
        setMeta(res.data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(reload, [type, debouncedSearch, page])

  const canManage = can('customers.manage')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Customers</h1>
        {canManage && (
          <Link to="/customers/new" className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700">
            + New Customer
          </Link>
        )}
      </div>

      {canManage && <ImportExportBar exportEndpoint="/customers/export" importEndpoint="/customers/import" onImported={reload} />}

      <div className="flex gap-3 items-end bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-md border-gray-300 text-sm" placeholder="Name, code..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All types</option>
            {CUSTOMER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {(type || search) && (
          <button onClick={() => { setType(''); setSearch('') }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800">
            Clear
          </button>
        )}
      </div>

      {canManage && (
        <BulkActionsBar endpoint="/customers/bulk" selectedIds={[...selected]} label="customer(s)" onDone={() => { clear(); reload() }} />
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              {canManage && (
                <th className="px-4 py-2 w-8">
                  <input type="checkbox" checked={customers.length > 0 && customers.every((c) => isSelected(c.id))} onChange={() => toggleAll(customers.map((c) => c.id))} className="rounded border-gray-300" />
                </th>
              )}
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No customers match your filters.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className={isSelected(c.id) ? 'bg-indigo-50' : ''}>
                  {canManage && (
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={isSelected(c.id)} onChange={() => toggle(c.id)} className="rounded border-gray-300" />
                    </td>
                  )}
                  <td className="px-4 py-2">
                    <Link to={`/customers/${c.id}`} className="text-indigo-600 hover:underline">{c.customer_code}</Link>
                  </td>
                  <td className="px-4 py-2">{c.display_name}</td>
                  <td className="px-4 py-2">{c.customer_type}</td>
                  <td className="px-4 py-2">{c.contact_number ?? '—'}</td>
                  <td className="px-4 py-2">{c.active ? <span className="text-green-700 text-xs">Active</span> : <span className="text-gray-400 text-xs">Inactive</span>}</td>
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
