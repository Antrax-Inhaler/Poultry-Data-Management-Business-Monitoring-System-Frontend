import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'
import type { InventoryItem, InventoryTransaction } from '../api/types'
import { useAuth } from '../context/AuthContext'

export default function InventoryDetail() {
  const { id } = useParams()
  const { can } = useAuth()
  const [item, setItem] = useState<(InventoryItem & { transactions: InventoryTransaction[] }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState('IN')
  const [quantity, setQuantity] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)

  function reload() {
    client.get(`/inventory/${id}`).then((res) => setItem(res.data.data))
  }

  useEffect(reload, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await client.post(`/inventory/${id}/transactions`, { type, quantity: Number(quantity), date })
      setQuantity('')
      reload()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to record transaction.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!item) return <div className="text-gray-400">Loading…</div>

  const low = item.quantity <= item.minimum_stock

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">{item.item}</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Current Stock" value={`${item.quantity} ${item.unit}`} warn={low} />
        <Stat label="Minimum Stock" value={`${item.minimum_stock} ${item.unit}`} />
        <Stat label="Unit Cost" value={`₱${item.unit_cost.toLocaleString()}`} />
        <Stat label="Category" value={item.category} />
      </div>

      {can('inventory.manage') && (
        <div className="bg-white shadow-sm rounded-lg p-5">
          <h3 className="font-medium text-gray-800 mb-3">Record Stock Transaction</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border-gray-300 text-sm">
                <option value="IN">IN (restock)</option>
                <option value="OUT">OUT (usage)</option>
                <option value="ADJUSTMENT">ADJUSTMENT (set exact stock)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Quantity</label>
              <input type="number" step="0.01" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
            </div>
            <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b font-medium text-gray-800">Transaction History</div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Quantity</th></tr>
          </thead>
          <tbody className="divide-y">
            {item.transactions.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No transactions yet.</td></tr>
            ) : (
              item.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-2">{tx.date}</td>
                  <td className="px-4 py-2">{tx.type}</td>
                  <td className="px-4 py-2">{tx.quantity} {item.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-semibold ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  )
}
