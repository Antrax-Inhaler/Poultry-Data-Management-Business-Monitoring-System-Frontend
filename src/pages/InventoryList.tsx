import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import type { InventoryItem, Paginated } from '../api/types'
import { INVENTORY_CATEGORIES } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import Pagination from '../components/Pagination'

export default function InventoryList() {
  const { can } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [category, setCategory] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => setPage(1), [category, lowStockOnly, debouncedSearch])

  function reload() {
    setLoading(true)
    client
      .get<Paginated<InventoryItem>>('/inventory', {
        params: { category: category || undefined, low_stock: lowStockOnly || undefined, search: debouncedSearch || undefined, page },
      })
      .then((res) => {
        setItems(res.data.data)
        setMeta(res.data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(reload, [category, lowStockOnly, debouncedSearch, page])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Inventory</h1>
        {can('inventory.manage') && (
          <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700">
            {showForm ? 'Cancel' : '+ New Item'}
          </button>
        )}
      </div>

      {showForm && <ItemForm onSaved={() => { setShowForm(false); reload() }} />}

      <div className="flex gap-3 items-end bg-white p-4 rounded-lg shadow-sm flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-md border-gray-300 text-sm" placeholder="Item name..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All categories</option>
            {INVENTORY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input type="checkbox" id="low_stock" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="rounded border-gray-300" />
          <label htmlFor="low_stock" className="text-sm text-gray-600">Low stock only</label>
        </div>
        {(category || search || lowStockOnly) && (
          <button onClick={() => { setCategory(''); setSearch(''); setLowStockOnly(false) }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800">
            Clear
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Min. Stock</th>
              <th className="px-4 py-2">Unit Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No inventory items match your filters.</td></tr>
            ) : (
              items.map((item) => {
                const low = item.quantity <= item.minimum_stock
                return (
                  <tr key={item.id} className={low ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2">
                      <Link to={`/inventory/${item.id}`} className="text-indigo-600 hover:underline">{item.item}</Link>
                    </td>
                    <td className="px-4 py-2">{item.category}</td>
                    <td className={`px-4 py-2 ${low ? 'text-red-600 font-medium' : ''}`}>{item.quantity} {item.unit}</td>
                    <td className="px-4 py-2">{item.minimum_stock} {item.unit}</td>
                    <td className="px-4 py-2">₱{item.unit_cost.toLocaleString()}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  )
}

function ItemForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    item: '',
    category: INVENTORY_CATEGORIES[0] as string,
    unit: '',
    minimum_stock: '0',
    unit_cost: '0',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await client.post('/inventory', form)
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
        <label className="block text-xs text-gray-500 mb-1">Item Name</label>
        <input required value={form.item} onChange={(e) => set('item', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
        {errors.item && <p className="text-xs text-red-600 mt-1">{errors.item[0]}</p>}
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Category</label>
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
          {INVENTORY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Unit</label>
        <input required placeholder="pcs, bottles, kg..." value={form.unit} onChange={(e) => set('unit', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Minimum Stock</label>
        <input type="number" step="0.01" value={form.minimum_stock} onChange={(e) => set('minimum_stock', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Unit Cost (₱)</label>
        <input type="number" step="0.01" value={form.unit_cost} onChange={(e) => set('unit_cost', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </div>
      <div className="flex items-end">
        <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Create Item'}
        </button>
      </div>
    </form>
  )
}
