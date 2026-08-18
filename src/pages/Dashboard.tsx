import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import type { DashboardData } from '../api/types'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    client.get<DashboardData>('/dashboard').then((res) => setData(res.data))
  }, [])

  if (!data) return <div className="text-gray-400">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active Batches" value={data.active_batch_count} />
        <Stat label="Total Live Birds" value={data.total_live_birds.toLocaleString()} />
        <Stat
          label="Overall Mortality"
          value={`${data.overall_mortality_rate}%`}
          warn={data.overall_mortality_rate > data.target_mortality_pct}
          sub={`Target: ${data.target_mortality_pct}%`}
        />
        <Stat label="Approaching Market Age" value={data.near_market_age_batches.length} />
      </div>

      {data.near_market_age_batches.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="font-medium text-amber-800 mb-1">Alerts</div>
          <ul className="text-sm text-amber-700 list-disc list-inside">
            {data.near_market_age_batches.map((b) => (
              <li key={b.id}>
                Batch {b.batch_code} is {b.age_in_days} days old — approaching target market age.
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.reorder_forecast.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-800">Customers Likely to Reorder Soon</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Predicted from each customer's own past order spacing — call the overdue ones before they go elsewhere.
            </p>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Last Order</th>
                <th className="px-4 py-2">Predicted Next Order</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.reorder_forecast.map((r) => (
                <tr key={r.customer_id}>
                  <td className="px-4 py-2">
                    <Link to={`/customers/${r.customer_id}`} className="text-indigo-600 hover:underline">{r.display_name}</Link>
                  </td>
                  <td className="px-4 py-2">{r.contact_number ?? '—'}</td>
                  <td className="px-4 py-2">{r.last_order_date}</td>
                  <td className="px-4 py-2">{r.predicted_next_order_date}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        r.status === 'Overdue' ? 'bg-red-100 text-red-700' : r.status === 'Due Soon' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium text-gray-800">Active Batches</h3>
          <Link to="/batches" className="text-sm text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Alive</th>
              <th className="px-4 py-2">Mortality %</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.active_batches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No active batches yet.
                </td>
              </tr>
            ) : (
              data.active_batches.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2">
                    <Link to={`/batches/${b.id}`} className="text-indigo-600 hover:underline">
                      {b.batch_code}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{b.status}</td>
                  <td className="px-4 py-2">{b.age_in_days ?? '—'}</td>
                  <td className="px-4 py-2">{b.current_quantity.toLocaleString()}</td>
                  <td className="px-4 py-2">{b.mortality_rate}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, warn, sub }: { label: string; value: string | number; warn?: boolean; sub?: string }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  )
}
