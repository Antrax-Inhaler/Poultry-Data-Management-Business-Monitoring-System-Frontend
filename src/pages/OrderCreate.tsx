import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import OrderForm, { emptyOrderForm, type OrderFormValues } from '../components/OrderForm'

export default function OrderCreate() {
  const navigate = useNavigate()

  async function handleSubmit(values: OrderFormValues) {
    const res = await client.post('/orders', values)
    navigate(`/orders/${res.data.data.id}`)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">New Order</h1>
      <OrderForm initial={emptyOrderForm} submitLabel="Create Order" onSubmit={handleSubmit} />
    </div>
  )
}
