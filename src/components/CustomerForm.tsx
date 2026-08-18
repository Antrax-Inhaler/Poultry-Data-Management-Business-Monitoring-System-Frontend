import { useState, type FormEvent } from 'react'
import { CUSTOMER_TYPES } from '../api/types'

export interface CustomerFormValues {
  customer_code: string
  customer_type: string
  business_name: string
  contact_person: string
  contact_number: string
  address: string
  barangay: string
  municipality: string
  preferred_product: string
  preferred_order_frequency: string
  payment_terms: string
  active: boolean
  notes: string
}

export const emptyCustomerForm: CustomerFormValues = {
  customer_code: '',
  customer_type: CUSTOMER_TYPES[0],
  business_name: '',
  contact_person: '',
  contact_number: '',
  address: '',
  barangay: '',
  municipality: '',
  preferred_product: '',
  preferred_order_frequency: '',
  payment_terms: '',
  active: true,
  notes: '',
}

export default function CustomerForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: CustomerFormValues
  submitLabel: string
  onSubmit: (values: CustomerFormValues) => Promise<void>
}) {
  const [form, setForm] = useState<CustomerFormValues>(initial)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) {
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
      <Field label="Customer Code *" error={errors.customer_code}>
        <input required value={form.customer_code} onChange={(e) => set('customer_code', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Customer Type *">
        <select value={form.customer_type} onChange={(e) => set('customer_type', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
          {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Business / Name">
        <input value={form.business_name} onChange={(e) => set('business_name', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Contact Person">
        <input value={form.contact_person} onChange={(e) => set('contact_person', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Contact Number">
        <input value={form.contact_number} onChange={(e) => set('contact_number', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Address">
        <input value={form.address} onChange={(e) => set('address', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Barangay">
        <input value={form.barangay} onChange={(e) => set('barangay', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Municipality">
        <input value={form.municipality} onChange={(e) => set('municipality', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Preferred Product">
        <input value={form.preferred_product} onChange={(e) => set('preferred_product', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Preferred Order Frequency">
        <input value={form.preferred_order_frequency} onChange={(e) => set('preferred_order_frequency', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Payment Terms">
        <input value={form.payment_terms} onChange={(e) => set('payment_terms', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="active" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="rounded border-gray-300" />
        <label htmlFor="active" className="text-sm text-gray-600">Active</label>
      </div>
      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className="w-full rounded-md border-gray-300 text-sm" />
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
