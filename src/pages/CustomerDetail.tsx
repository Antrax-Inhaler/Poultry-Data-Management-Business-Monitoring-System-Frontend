import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import type { Customer, Order, ReorderForecast } from '../api/types'
import { useAuth } from '../context/AuthContext'

export default function CustomerDetail() {
  const { id } = useParams()
  const { can } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [forecast, setForecast] = useState<ReorderForecast | null>(null)

  useEffect(() => {
    client.get(`/customers/${id}`).then((res) => {
      setCustomer(res.data.data)
      setOrders(res.data.orders)
      setForecast(res.data.reorder_forecast)
    })
  }, [id])

  if (!customer) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          {customer.display_name} <span className="text-sm text-gray-400">({customer.customer_code})</span>
        </h1>
        {can('customers.manage') && (
          <Link to={`/customers/${customer.id}/edit`} className="text-sm text-indigo-600 hover:underline">Edit</Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white shadow-sm rounded-lg p-5 text-sm space-y-1">
          <div><span className="text-gray-500">Type:</span> {customer.customer_type}</div>
          <div><span className="text-gray-500">Contact:</span> {customer.contact_person ?? '—'} {customer.contact_number ?? ''}</div>
          <div><span className="text-gray-500">Address:</span> {customer.address ?? '—'}, {customer.barangay ?? ''} {customer.municipality ?? ''}</div>
          <div><span className="text-gray-500">Preferred Product:</span> {customer.preferred_product ?? '—'}</div>
          <div><span className="text-gray-500">Payment Terms:</span> {customer.payment_terms ?? '—'}</div>
        </div>

        {forecast ? (
          <div className="bg-white shadow-sm rounded-lg p-5 text-sm space-y-1">
            <div className="font-medium text-gray-800 mb-2">Reorder Forecast</div>
            <div><span className="text-gray-500">Based on:</span> {forecast.order_count} past orders</div>
            <div><span className="text-gray-500">Avg. Order Interval:</span> {forecast.avg_interval_days} days</div>
            <div><span className="text-gray-500">Predicted Next Order:</span> {forecast.predicted_next_order_date}</div>
            <div>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                  forecast.status === 'Overdue' ? 'bg-red-100 text-red-700' : forecast.status === 'Due Soon' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {forecast.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg p-5 text-sm text-gray-400">
            Not enough order history yet to predict a reorder pattern (needs at least 2 orders).
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b font-medium text-gray-800">Order History</div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Order #</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No orders yet.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-2"><Link to={`/orders/${o.id}`} className="text-indigo-600 hover:underline">{o.order_number}</Link></td>
                  <td className="px-4 py-2">{o.order_date}</td>
                  <td className="px-4 py-2">{o.product_type}</td>
                  <td className="px-4 py-2">₱{o.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-2">{o.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
