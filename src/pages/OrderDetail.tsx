import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import type { Order } from '../api/types'
import { useAuth } from '../context/AuthContext'

export default function OrderDetail() {
  const { id } = useParams()
  const { can } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    client.get(`/orders/${id}`).then((res) => setOrder(res.data.data))
  }, [id])

  if (!order) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Order {order.order_number}{' '}
          <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 align-middle">{order.status}</span>
        </h1>
        {can('orders.manage') && (
          <Link to={`/orders/${order.id}/edit`} className="text-sm text-indigo-600 hover:underline">Edit</Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Total Amount" value={`₱${order.total_amount.toLocaleString()}`} />
        <Stat label="Amount Paid" value={`₱${order.amount_paid.toLocaleString()}`} />
        <Stat label="Balance" value={`₱${order.balance.toLocaleString()}`} warn={order.balance > 0} />
        <Stat label="Payment Status" value={order.payment_status} />
      </div>

      <div className="bg-white shadow-sm rounded-lg p-5 text-sm space-y-2">
        <div><span className="text-gray-500">Customer:</span> {order.customer.display_name}</div>
        <div><span className="text-gray-500">Batch:</span> {order.batch_code ?? 'Unspecified'}</div>
        <div><span className="text-gray-500">Order Date:</span> {order.order_date}</div>
        <div><span className="text-gray-500">Requested Delivery:</span> {order.requested_delivery_date ?? '—'}</div>
        <div><span className="text-gray-500">Product:</span> {order.product_type} × {order.quantity}</div>
        <div><span className="text-gray-500">Weight used for revenue:</span> {order.billable_weight} kg @ ₱{order.price_per_kg.toLocaleString()}/kg</div>
        {order.dressed_yield !== null && <div><span className="text-gray-500">Dressed Yield:</span> {order.dressed_yield}%</div>}
        <div><span className="text-gray-500">Data Source:</span> {order.data_source}</div>
        {order.notes && <div><span className="text-gray-500">Notes:</span> {order.notes}</div>}
      </div>
    </div>
  )
}

function Stat({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-semibold ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  )
}
