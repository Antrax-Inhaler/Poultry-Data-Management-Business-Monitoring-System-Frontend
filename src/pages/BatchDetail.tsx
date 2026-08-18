import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'
import type { Batch, FeedLot } from '../api/types'
import { MORTALITY_REASONS, HEALTH_EVENT_TYPES } from '../api/types'
import { useAuth } from '../context/AuthContext'
import SuggestInput from '../components/SuggestInput'

export default function BatchDetail() {
  const { id } = useParams()
  const { can } = useAuth()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [feedLots, setFeedLots] = useState<FeedLot[]>([])
  const [error, setError] = useState<string | null>(null)

  function reload() {
    client.get(`/batches/${id}`).then((res) => setBatch(res.data.data))
  }

  useEffect(reload, [id])
  useEffect(() => {
    client.get('/feed/available-lots').then((res) => setFeedLots(res.data.data))
  }, [])

  if (!batch) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Batch {batch.batch_code}{' '}
          <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 align-middle">{batch.status}</span>
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Age" value={`${batch.age_in_days ?? '—'} days`} />
        <Stat label="Alive" value={`${batch.current_quantity} / ${batch.initial_quantity}`} />
        <Stat label="Mortality" value={`${batch.mortality_rate}%`} />
        <Stat label="Latest Avg Weight" value={batch.latest_average_weight ? `${batch.latest_average_weight} kg` : '—'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Stat label="Total Feed" value={`${batch.total_feed_kg} kg`} />
        <Stat label="Feed Cost" value={`₱${batch.total_feed_cost.toLocaleString()}`} />
        <Stat label="FCR" value={batch.fcr > 0 ? batch.fcr : '—'} />
      </div>

      <div className="bg-white shadow-sm rounded-lg p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-800">Batch Profitability</h3>
          <span className="text-xs text-gray-400">{batch.status === 'Completed' ? 'ACTUAL' : 'ESTIMATED (batch still open)'}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <Stat label="Revenue" value={`₱${batch.total_revenue.toLocaleString()}`} compact />
          <Stat label="Total Cost" value={`₱${batch.total_cost.toLocaleString()}`} compact />
          <Stat label="Gross Margin" value={`₱${batch.gross_margin.toLocaleString()}`} compact warn={batch.gross_margin < 0} />
          <Stat label="ROI" value={`${batch.roi}%`} compact />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {can('mortality.manage') && (
          <QuickMortalityForm batchId={batch.id} maxQuantity={batch.current_quantity} onSaved={reload} onError={setError} />
        )}
        {can('weights.manage') && <QuickWeightForm batchId={batch.id} onSaved={reload} onError={setError} />}
        {can('feed.manage') && <QuickFeedForm batchId={batch.id} lots={feedLots} onSaved={reload} onError={setError} />}
        {can('health.manage') && (
          <QuickHealthForm
            batchId={batch.id}
            medications={(batch.health_records ?? []).map((r) => r.medication_vaccine).filter((m): m is string => !!m)}
            onSaved={reload}
            onError={setError}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LogTable
          title="Mortality Log"
          rows={batch.mortality_logs ?? []}
          cols={['Date', 'Qty', 'Reason']}
          render={(r: any) => [r.date, r.quantity, r.suspected_reason]}
        />
        <LogTable
          title="Weight Samples"
          rows={batch.weight_logs ?? []}
          cols={['Date', 'Sample', 'Avg (kg)']}
          render={(r: any) => [r.date, r.sample_size, r.average_weight_kg]}
        />
        <LogTable
          title="Feed Consumption"
          rows={batch.feed_consumptions ?? []}
          cols={['Date', 'Type', 'Sacks', 'Kg', 'Cost']}
          render={(r: any) => [r.date, r.feed_type, r.quantity_sacks, r.quantity_kg, `₱${Number(r.cost).toLocaleString()}`]}
        />
        <LogTable
          title="Health Records"
          rows={batch.health_records ?? []}
          cols={['Date', 'Event', 'Medication', 'Cost']}
          render={(r: any) => [r.date, r.event_type, r.medication_vaccine ?? '—', `₱${Number(r.cost).toLocaleString()}`]}
        />
      </div>
    </div>
  )
}

function Stat({ label, value, warn, compact }: { label: string; value: string | number; warn?: boolean; compact?: boolean }) {
  return (
    <div className={compact ? '' : 'bg-white shadow-sm rounded-lg p-4'}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`${compact ? 'text-lg' : 'text-2xl'} font-semibold ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  )
}

function LogTable({ title, rows, cols, render }: { title: string; rows: any[]; cols: string[]; render: (row: any) => (string | number)[] }) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b font-medium text-gray-800">{title}</div>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>{cols.map((c) => <th key={c} className="px-4 py-2">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} className="px-4 py-6 text-center text-gray-400">No records yet.</td></tr>
          ) : (
            rows.map((r, i) => <tr key={i}>{render(r).map((v, j) => <td key={j} className="px-4 py-2">{v}</td>)}</tr>)
          )}
        </tbody>
      </table>
    </div>
  )
}

function QuickMortalityForm({
  batchId,
  maxQuantity,
  onSaved,
  onError,
}: {
  batchId: number
  maxQuantity: number
  onSaved: () => void
  onError: (msg: string | null) => void
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState<string>(MORTALITY_REASONS[0])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    onError(null)
    try {
      await client.post(`/batches/${batchId}/mortality`, { date, quantity: Number(quantity), suspected_reason: reason })
      setQuantity('')
      onSaved()
    } catch (err: any) {
      onError(err.response?.data?.message ?? 'Failed to record mortality.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-5">
      <h3 className="font-medium text-gray-800 mb-3">Quick Mortality Entry</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Deaths (max {maxQuantity} alive)</label>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Reason</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
            {MORTALITY_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}

function QuickWeightForm({ batchId, onSaved, onError }: { batchId: number; onSaved: () => void; onError: (msg: string | null) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [sampleSize, setSampleSize] = useState('')
  const [totalWeight, setTotalWeight] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    onError(null)
    try {
      await client.post(`/batches/${batchId}/weights`, {
        date,
        sample_size: Number(sampleSize),
        total_sample_weight_kg: Number(totalWeight),
      })
      setSampleSize('')
      setTotalWeight('')
      onSaved()
    } catch (err: any) {
      onError(err.response?.data?.message ?? 'Failed to record weight.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-5">
      <h3 className="font-medium text-gray-800 mb-3">Quick Weight Sample</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Sample Size (birds)</label>
          <input type="number" min="1" value={sampleSize} onChange={(e) => setSampleSize(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Total Sample Weight (kg)</label>
          <input type="number" step="0.001" min="0.001" value={totalWeight} onChange={(e) => setTotalWeight(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" required />
        </div>
        <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}

function QuickFeedForm({
  batchId,
  lots,
  onSaved,
  onError,
}: {
  batchId: number
  lots: FeedLot[]
  onSaved: () => void
  onError: (msg: string | null) => void
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [lotId, setLotId] = useState(lots[0] ? String(lots[0].id) : '')
  const [quantitySacks, setQuantitySacks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (lots.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-5">
        <h3 className="font-medium text-gray-800 mb-3">Quick Feed Consumption</h3>
        <p className="text-sm text-gray-400">No feed stock available. Record a purchase first.</p>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    onError(null)
    try {
      await client.post(`/batches/${batchId}/feed-consumption`, {
        date,
        feed_purchase_id: Number(lotId),
        quantity_sacks: Number(quantitySacks),
      })
      setQuantitySacks('')
      onSaved()
    } catch (err: any) {
      onError(err.response?.data?.message ?? 'Failed to record feed consumption.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-5">
      <h3 className="font-medium text-gray-800 mb-3">Quick Feed Consumption</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Feed Lot</label>
          <select value={lotId} onChange={(e) => setLotId(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.feed_type} — {l.remaining_quantity_sacks} sacks left ({l.purchase_date})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Quantity (sacks)</label>
          <input type="number" step="0.01" min="0.01" value={quantitySacks} onChange={(e) => setQuantitySacks(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" required />
        </div>
        <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}

function QuickHealthForm({
  batchId,
  medications,
  onSaved,
  onError,
}: {
  batchId: number
  medications: string[]
  onSaved: () => void
  onError: (msg: string | null) => void
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [eventType, setEventType] = useState<string>(HEALTH_EVENT_TYPES[0])
  const [medication, setMedication] = useState('')
  const [cost, setCost] = useState('0')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    onError(null)
    try {
      await client.post(`/batches/${batchId}/health`, {
        date,
        event_type: eventType,
        medication_vaccine: medication || null,
        cost: Number(cost),
      })
      setMedication('')
      setCost('0')
      onSaved()
    } catch (err: any) {
      onError(err.response?.data?.message ?? 'Failed to record health event.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-5">
      <h3 className="font-medium text-gray-800 mb-3">Quick Health Entry</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Event Type</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
            {HEALTH_EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Medication / Vaccine</label>
          <SuggestInput value={medication} onChange={setMedication} suggestions={medications} className="w-full rounded-md border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Cost (₱)</label>
          <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
        </div>
        <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
