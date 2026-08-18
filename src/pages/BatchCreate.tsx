import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import type { Batch } from '../api/types'
import { BATCH_STATUSES } from '../api/types'
import { useDistinctValues } from '../hooks/useDistinctValues'
import SuggestInput from '../components/SuggestInput'

export default function BatchCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    batch_code: '',
    status: 'Planned',
    received_date: '',
    initial_quantity: '',
    breed_strain: '',
    supplier: '',
    housing_section: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const breedStrains = useDistinctValues<Batch>('/batches', (b) => [b.breed_strain])
  const suppliers = useDistinctValues<Batch>('/batches', (b) => [b.supplier])
  const housingSections = useDistinctValues<Batch>('/batches', (b) => [b.housing_section])

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const res = await client.post('/batches', form)
      navigate(`/batches/${res.data.data.id}`)
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">New Batch</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-4">
        <Field label="Batch Code *" error={errors.batch_code}>
          <input required value={form.batch_code} onChange={(e) => set('batch_code', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
        </Field>
        <Field label="Status *">
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
            {BATCH_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Received Date">
          <input type="date" value={form.received_date} onChange={(e) => set('received_date', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
        </Field>
        <Field label="Initial Quantity *" error={errors.initial_quantity}>
          <input type="number" min="1" required value={form.initial_quantity} onChange={(e) => set('initial_quantity', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
        </Field>
        <Field label="Breed / Strain">
          <SuggestInput value={form.breed_strain} onChange={(v) => set('breed_strain', v)} suggestions={breedStrains} className="w-full rounded-md border-gray-300 text-sm" />
        </Field>
        <Field label="Supplier">
          <SuggestInput value={form.supplier} onChange={(v) => set('supplier', v)} suggestions={suppliers} className="w-full rounded-md border-gray-300 text-sm" />
        </Field>
        <Field label="Housing / Section">
          <SuggestInput value={form.housing_section} onChange={(v) => set('housing_section', v)} suggestions={housingSections} className="w-full rounded-md border-gray-300 text-sm" />
        </Field>
        <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Create Batch'}
        </button>
      </form>
    </div>
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
