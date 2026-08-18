import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import type { Order } from '../api/types'
import OrderForm, { type OrderFormValues } from '../components/OrderForm'

export default function OrderEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initial, setInitial] = useState<OrderFormValues | null>(null)

  useEffect(() => {
    client.get(`/orders/${id}`).then((res) => {
      const o: Order = res.data.data
      setInitial({
        customer_id: String(o.customer.id),
        order_date: o.order_date,
        product_type: o.product_type,
        quantity: String(o.quantity),
        actual_weight_kg: o.actual_weight_kg !== null ? String(o.actual_weight_kg) : '',
        price_per_kg: String(o.price_per_kg),
        status: o.status,
        payment_status: o.payment_status,
        amount_paid: String(o.amount_paid),
      })
    })
  }, [id])

  async function handleSubmit(values: OrderFormValues) {
    await client.put(`/orders/${id}`, values)
    navigate(`/orders/${id}`)
  }

  if (!initial) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Edit Order</h1>
      <OrderForm initial={initial} submitLabel="Save Changes" onSubmit={handleSubmit} />
    </div>
  )
}
