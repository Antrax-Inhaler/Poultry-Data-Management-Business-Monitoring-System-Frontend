import { useEffect, useMemo, useState, type FormEvent } from 'react'
import client from '../api/client'
import type { Expense, Paginated } from '../api/types'
import { EXPENSE_CATEGORIES } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useCachedList } from '../hooks/useDistinctValues'
import { useSelection } from '../hooks/useSelection'
import Pagination from '../components/Pagination'
import BulkActionsBar from '../components/BulkActionsBar'
import ImportExportBar from '../components/ImportExportBar'
import SuggestInput from '../components/SuggestInput'

export default function ExpenseList() {
  const { can } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const debouncedSearch = useDebouncedValue(search)
  const { selected, toggle, toggleAll, clear, isSelected } = useSelection()

  useEffect(() => setPage(1), [category, debouncedSearch])

  function reload() {
    setLoading(true)
    client
      .get<Paginated<Expense>>('/expenses', { params: { category: category || undefined, search: debouncedSearch || undefined, page } })
      .then((res) => {
        setExpenses(res.data.data)
        setMeta(res.data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(reload, [category, debouncedSearch, page])

  const canManage = can('expenses.manage')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Expenses</h1>
        {canManage && (
          <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700">
            {showForm ? 'Cancel' : '+ Record Expense'}
          </button>
        )}
      </div>

      {showForm && <ExpenseForm onSaved={() => { setShowForm(false); reload() }} />}

      {canManage && <ImportExportBar exportEndpoint="/expenses/export" importEndpoint="/expenses/import" requiresDataSource onImported={reload} />}

      <div className="flex gap-3 items-end bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-md border-gray-300 text-sm" placeholder="Description, supplier..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border-gray-300 text-sm">
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {(category || search) && (
          <button onClick={() => { setCategory(''); setSearch('') }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800">
            Clear
          </button>
        )}
      </div>

      {canManage && (
        <BulkActionsBar endpoint="/expenses/bulk" selectedIds={[...selected]} label="expense(s)" onDone={() => { clear(); reload() }} />
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              {canManage && (
                <th className="px-4 py-2 w-8">
                  <input type="checkbox" checked={expenses.length > 0 && expenses.every((e) => isSelected(e.id))} onChange={() => toggleAll(expenses.map((e) => e.id))} className="rounded border-gray-300" />
                </th>
              )}
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No expenses match your filters.</td></tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className={isSelected(e.id) ? 'bg-indigo-50' : ''}>
                  {canManage && (
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={isSelected(e.id)} onChange={() => toggle(e.id)} className="rounded border-gray-300" />
                    </td>
                  )}
                  <td className="px-4 py-2">{e.date}</td>
                  <td className="px-4 py-2">{e.category}</td>
                  <td className="px-4 py-2">{e.description}</td>
                  <td className="px-4 py-2">{e.batch?.batch_code ?? 'General'}</td>
                  <td className="px-4 py-2">₱{e.amount.toLocaleString()}</td>
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

function ExpenseForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: EXPENSE_CATEGORIES[0] as string,
    description: '',
    amount: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const allExpenses = useCachedList<Expense>('/expenses')
  const descriptions = useMemo(
    () =>
      Array.from(
        new Set(
          allExpenses
            .filter((e) => e.category === form.category)
            .map((e) => e.description)
            .filter(Boolean),
        ),
      ),
    [allExpenses, form.category],
  )

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await client.post('/expenses', form)
      onSaved()
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Date</label>
        <input type="date" required value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Category</label>
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs text-gray-500 mb-1">Description</label>
        <SuggestInput required value={form.description} onChange={(v) => set('description', v)} suggestions={descriptions} className="w-full rounded-md border-gray-300 text-sm" />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description[0]}</p>}
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Amount (₱)</label>
        <input type="number" step="0.01" required value={form.amount} onChange={(e) => set('amount', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
        {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount[0]}</p>}
      </div>
      <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
        {submitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
