import { useEffect, useState, type FormEvent } from 'react'
import client from '../api/client'
import type { FeedPurchase, Paginated } from '../api/types'
import { FEED_TYPES } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useDistinctValues } from '../hooks/useDistinctValues'
import Pagination from '../components/Pagination'
import ImportExportBar from '../components/ImportExportBar'
import SuggestInput from '../components/SuggestInput'

export default function FeedList() {
  const { can } = useAuth()
  const [purchases, setPurchases] = useState<FeedPurchase[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [feedType, setFeedType] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => setPage(1), [feedType, debouncedSearch])

  function reload() {
    setLoading(true)
    client
      .get<Paginated<FeedPurchase>>('/feed', { params: { feed_type: feedType || undefined, search: debouncedSearch || undefined, page } })
      .then((res) => {
        setPurchases(res.data.data)
        setMeta(res.data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(reload, [feedType, debouncedSearch, page])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Feed Inventory</h1>
        {can('feed.manage') && (
          <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700">
            {showForm ? 'Cancel' : '+ Record Purchase'}
          </button>
        )}
      </div>

      {showForm && <FeedPurchaseForm onSaved={() => { setShowForm(false); reload() }} />}

      {can('feed.manage') && <ImportExportBar exportEndpoint="/feed/export" importEndpoint="/feed/import" requiresDataSource onImported={reload} />}

      <div className="flex gap-3 items-end bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search supplier</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-md border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Feed Type</label>
          <select value={feedType} onChange={(e) => setFeedType(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All types</option>
            {FEED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {(feedType || search) && (
          <button onClick={() => { setFeedType(''); setSearch('') }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800">
            Clear
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2">Bought</th>
              <th className="px-4 py-2">Remaining</th>
              <th className="px-4 py-2">Cost/Sack</th>
              <th className="px-4 py-2">Total Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No feed purchases match your filters.</td></tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} className={p.remaining_quantity_sacks <= 0 ? 'text-gray-400' : ''}>
                  <td className="px-4 py-2">{p.purchase_date.slice(0, 10)}</td>
                  <td className="px-4 py-2">{p.feed_type}</td>
                  <td className="px-4 py-2">{p.supplier ?? '—'}</td>
                  <td className="px-4 py-2">{p.quantity_sacks}</td>
                  <td className="px-4 py-2">{p.remaining_quantity_sacks}</td>
                  <td className="px-4 py-2">₱{p.cost_per_sack.toLocaleString()}</td>
                  <td className="px-4 py-2">₱{p.total_cost.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  )
}

function FeedPurchaseForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    feed_type: FEED_TYPES[0] as string,
    supplier: '',
    sack_size_kg: '50',
    quantity_sacks: '',
    cost_per_sack: '',
    purchase_date: new Date().toISOString().slice(0, 10),
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const suppliers = useDistinctValues<FeedPurchase>('/feed', (p) => [p.supplier])

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await client.post('/feed', form)
      onSaved()
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Feed Type</label>
        <select value={form.feed_type} onChange={(e) => set('feed_type', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
          {FEED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Supplier</label>
        <SuggestInput value={form.supplier} onChange={(v) => set('supplier', v)} suggestions={suppliers} className="w-full rounded-md border-gray-300 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Purchase Date</label>
        <input type="date" required value={form.purchase_date} onChange={(e) => set('purchase_date', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Sack Size (kg)</label>
        <input type="number" step="0.01" required value={form.sack_size_kg} onChange={(e) => set('sack_size_kg', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Quantity (sacks)</label>
        <input type="number" step="0.01" required value={form.quantity_sacks} onChange={(e) => set('quantity_sacks', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
        {errors.quantity_sacks && <p className="text-xs text-red-600 mt-1">{errors.quantity_sacks[0]}</p>}
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Cost per Sack (₱)</label>
        <input type="number" step="0.01" required value={form.cost_per_sack} onChange={(e) => set('cost_per_sack', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </div>
      <div>
        <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Save Purchase'}
        </button>
      </div>
    </form>
  )
}
