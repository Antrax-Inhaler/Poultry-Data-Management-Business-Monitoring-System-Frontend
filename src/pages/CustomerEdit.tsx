import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import type { Customer } from '../api/types'
import CustomerForm, { type CustomerFormValues } from '../components/CustomerForm'

export default function CustomerEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initial, setInitial] = useState<CustomerFormValues | null>(null)

  useEffect(() => {
    client.get(`/customers/${id}`).then((res) => {
      const c: Customer = res.data.data
      setInitial({
        customer_code: c.customer_code,
        customer_type: c.customer_type,
        business_name: c.business_name ?? '',
        contact_person: c.contact_person ?? '',
        contact_number: c.contact_number ?? '',
        address: c.address ?? '',
        barangay: c.barangay ?? '',
        municipality: c.municipality ?? '',
        preferred_product: c.preferred_product ?? '',
        preferred_order_frequency: c.preferred_order_frequency ?? '',
        payment_terms: c.payment_terms ?? '',
        active: c.active,
        notes: c.notes ?? '',
      })
    })
  }, [id])

  async function handleSubmit(values: CustomerFormValues) {
    await client.put(`/customers/${id}`, values)
    navigate(`/customers/${id}`)
  }

  if (!initial) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Edit Customer</h1>
      <CustomerForm initial={initial} submitLabel="Save Changes" onSubmit={handleSubmit} />
    </div>
  )
}
