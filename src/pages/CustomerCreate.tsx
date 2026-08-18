import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import CustomerForm, { emptyCustomerForm, type CustomerFormValues } from '../components/CustomerForm'

export default function CustomerCreate() {
  const navigate = useNavigate()

  async function handleSubmit(values: CustomerFormValues) {
    const res = await client.post('/customers', values)
    navigate(`/customers/${res.data.data.id}`)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">New Customer</h1>
      <CustomerForm initial={emptyCustomerForm} submitLabel="Create Customer" onSubmit={handleSubmit} />
    </div>
  )
}
