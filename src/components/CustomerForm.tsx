import { useState, type FormEvent } from 'react'
import { CUSTOMER_TYPES } from '../api/types'
import type { Customer } from '../api/types'
import { useDistinctValues } from '../hooks/useDistinctValues'
import SuggestInput from './SuggestInput'

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

  const barangays = useDistinctValues<Customer>('/customers', (c) => [c.barangay])
  const municipalities = useDistinctValues<Customer>('/customers', (c) => [c.municipality])
  const contactPersons = useDistinctValues<Customer>('/customers', (c) => [c.contact_person])
  const preferredProducts = useDistinctValues<Customer>('/customers', (c) => [c.preferred_product])
  const orderFrequencies = useDistinctValues<Customer>('/customers', (c) => [c.preferred_order_frequency])
  const paymentTerms = useDistinctValues<Customer>('/customers', (c) => [c.payment_terms])

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
        <SuggestInput value={form.contact_person} onChange={(v) => set('contact_person', v)} suggestions={contactPersons} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Contact Number">
        <input value={form.contact_number} onChange={(e) => set('contact_number', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Address">
        <input value={form.address} onChange={(e) => set('address', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Barangay">
        <SuggestInput value={form.barangay} onChange={(v) => set('barangay', v)} suggestions={barangays} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Municipality">
        <SuggestInput value={form.municipality} onChange={(v) => set('municipality', v)} suggestions={municipalities} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Preferred Product">
        <SuggestInput value={form.preferred_product} onChange={(v) => set('preferred_product', v)} suggestions={preferredProducts} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Preferred Order Frequency">
        <SuggestInput value={form.preferred_order_frequency} onChange={(v) => set('preferred_order_frequency', v)} suggestions={orderFrequencies} className="w-full rounded-md border-gray-300 text-sm" />
      </Field>
      <Field label="Payment Terms">
        <SuggestInput value={form.payment_terms} onChange={(v) => set('payment_terms', v)} suggestions={paymentTerms} className="w-full rounded-md border-gray-300 text-sm" />
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
