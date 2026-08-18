import { useEffect, useState, type FormEvent } from 'react'
import client from '../api/client'
import type { Customer, Paginated } from '../api/types'
import { PRODUCT_TYPES, ORDER_STATUSES, PAYMENT_STATUSES } from '../api/types'

export interface OrderFormValues {
  customer_id: string
  order_date: string
  product_type: string
  quantity: string
  actual_weight_kg: string
  price_per_kg: string
  status: string
  payment_status: string
  amount_paid: string
}

export const emptyOrderForm: OrderFormValues = {
  customer_id: '',
  order_date: new Date().toISOString().slice(0, 10),
  product_type: PRODUCT_TYPES[0],
  quantity: '',
  actual_weight_kg: '',
  price_per_kg: '',
  status: 'Draft',
  payment_status: 'Unpaid',
  amount_paid: '0',
}

export default function OrderForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: OrderFormValues
  submitLabel: string
  onSubmit: (values: OrderFormValues) => Promise<void>
}) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState<OrderFormValues>(initial)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    client.get<Paginated<Customer>>('/customers', { params: { per_page: 200 } }).then((res) => setCustomers(res.data.data))
  }, [])

  function set<K extends keyof OrderFormValues>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await onSubmit(form)
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-4">
      <Field label="Customer *" error={errors.customer_id}>
        <select required value={form.customer_id} onChange={(e) => set('customer_id', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
          <option value="">Select customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
        </select>
      </Field>
      <Field label="Order Date *">
        <input type="date" required value={form.order_date} onChange={(e) => set('order_date', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Product Type *">
        <select value={form.product_type} onChange={(e) => set('product_type', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
          {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Quantity (birds) *" error={errors.quantity}>
        <input type="number" min="1" required value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Actual Live Weight (kg)">
        <input type="number" step="0.001" value={form.actual_weight_kg} onChange={(e) => set('actual_weight_kg', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Price per kg (₱) *" error={errors.price_per_kg}>
        <input type="number" step="0.01" required value={form.price_per_kg} onChange={(e) => set('price_per_kg', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Status">
        <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Payment Status">
        <select value={form.payment_status} onChange={(e) => set('payment_status', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Amount Paid (₱)">
        <input type="number" step="0.01" value={form.amount_paid} onChange={(e) => set('amount_paid', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error[0]}</p>}
    </div>
  )
}
