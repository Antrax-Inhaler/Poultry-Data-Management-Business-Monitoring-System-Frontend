import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import type { Order, Paginated } from '../api/types'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useSelection } from '../hooks/useSelection'
import Pagination from '../components/Pagination'
import BulkActionsBar from '../components/BulkActionsBar'
import ImportExportBar from '../components/ImportExportBar'

export default function OrderList() {
  const { can } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const debouncedSearch = useDebouncedValue(search)
  const { selected, toggle, toggleAll, clear, isSelected } = useSelection()

  useEffect(() => setPage(1), [status, paymentStatus, debouncedSearch])

  function reload() {
    setLoading(true)
    client
      .get<Paginated<Order>>('/orders', {
        params: { status: status || undefined, payment_status: paymentStatus || undefined, search: debouncedSearch || undefined, page },
      })
      .then((res) => {
        setOrders(res.data.data)
        setMeta(res.data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(reload, [status, paymentStatus, debouncedSearch, page])

  const canManage = can('orders.manage')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Orders / Sales</h1>
        {canManage && (
          <Link to="/orders/new" className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700">
            + New Order
          </Link>
        )}
      </div>

      {canManage && <ImportExportBar exportEndpoint="/orders/export" importEndpoint="/orders/import" requiresDataSource onImported={reload} />}

      <div className="flex gap-3 items-end bg-white p-4 rounded-lg shadow-sm flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-md border-gray-300 text-sm" placeholder="Order #, customer..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Payment</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All payment states</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(status || paymentStatus || search) && (
          <button onClick={() => { setStatus(''); setPaymentStatus(''); setSearch('') }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800">
            Clear
          </button>
        )}
      </div>

      {canManage && (
        <BulkActionsBar endpoint="/orders/bulk" selectedIds={[...selected]} label="order(s)" onDone={() => { clear(); reload() }} />
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              {canManage && (
                <th className="px-4 py-2 w-8">
                  <input type="checkbox" checked={orders.length > 0 && orders.every((o) => isSelected(o.id))} onChange={() => toggleAll(orders.map((o) => o.id))} className="rounded border-gray-300" />
                </th>
              )}
              <th className="px-4 py-2">Order #</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Balance</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No orders match your filters.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className={isSelected(o.id) ? 'bg-indigo-50' : ''}>
                  {canManage && (
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={isSelected(o.id)} onChange={() => toggle(o.id)} className="rounded border-gray-300" />
                    </td>
                  )}
                  <td className="px-4 py-2"><Link to={`/orders/${o.id}`} className="text-indigo-600 hover:underline">{o.order_number}</Link></td>
                  <td className="px-4 py-2">{o.customer.display_name}</td>
                  <td className="px-4 py-2">{o.order_date}</td>
                  <td className="px-4 py-2">₱{o.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-2">₱{o.balance.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{o.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${o.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : o.payment_status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {o.payment_status}
                    </span>
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
