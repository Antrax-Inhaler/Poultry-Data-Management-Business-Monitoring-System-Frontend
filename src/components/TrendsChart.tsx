import { useEffect, useMemo, useRef, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import client from '../api/client'
import type { TrendsData } from '../api/types'

type MetricKey = 'revenue' | 'expenses' | 'profit' | 'feed_cost' | 'orders_count'

const METRICS: { key: MetricKey; label: string; color: string; axis?: 'left' | 'right' }[] = [
  { key: 'revenue', label: 'Sales', color: '#4f46e5' },
  { key: 'expenses', label: 'Expenses', color: '#dc2626' },
  { key: 'profit', label: 'Profit', color: '#16a34a' },
  { key: 'feed_cost', label: 'Feed Cost', color: '#d97706' },
  { key: 'orders_count', label: 'Orders (count)', color: '#0891b2', axis: 'right' },
]

const RANGE_PRESETS = ['This Quarter', 'This Month', 'Last 30 Days', 'This Year', 'Custom'] as const
type RangePreset = (typeof RANGE_PRESETS)[number]

function presetToRange(preset: RangePreset, customFrom: string, customTo: string): { from: string; to: string } {
  const today = new Date()
  const toStr = today.toISOString().slice(0, 10)
  const iso = (d: Date) => d.toISOString().slice(0, 10)

  switch (preset) {
    case 'This Month': {
      const from = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: iso(from), to: toStr }
    }
    case 'Last 30 Days': {
      const from = new Date(today)
      from.setDate(from.getDate() - 30)
      return { from: iso(from), to: toStr }
    }
    case 'This Year': {
      const from = new Date(today.getFullYear(), 0, 1)
      return { from: iso(from), to: toStr }
    }
    case 'Custom':
      return { from: customFrom || toStr, to: customTo || toStr }
    case 'This Quarter':
    default: {
      const from = new Date(today)
      from.setMonth(from.getMonth() - 3)
      return { from: iso(from), to: toStr }
    }
  }
}

function formatLabel(label: string, granularity: string): string {
  const d = new Date(label + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return label
  if (granularity === 'month') return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
  if (granularity === 'week') return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function TrendsChart() {
  const [preset, setPreset] = useState<RangePreset>('This Quarter')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(new Set(METRICS.map((m) => m.key)))
  const [metricsOpen, setMetricsOpen] = useState(false)
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  const range = useMemo(() => presetToRange(preset, customFrom, customTo), [preset, customFrom, customTo])

  useEffect(() => {
    setLoading(true)
    client
      .get<TrendsData>('/dashboard/trends', { params: { from: range.from, to: range.to } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [range.from, range.to])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMetricsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function toggleMetric(key: MetricKey) {
    setActiveMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const chartData = useMemo(
    () => (data?.points ?? []).map((p) => ({ ...p, label: formatLabel(p.label, data?.granularity ?? 'day') })),
    [data],
  )
  const hasOrdersAxis = activeMetrics.has('orders_count')

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-medium text-gray-800">Farm Performance Trends</h3>
        <div className="flex items-center gap-2">
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as RangePreset)}
            className="rounded-md border-gray-300 text-xs py-1"
          >
            {RANGE_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {preset === 'Custom' && (
            <>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="rounded-md border-gray-300 text-xs py-1" />
              <span className="text-gray-400 text-xs">to</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="rounded-md border-gray-300 text-xs py-1" />
            </>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMetricsOpen((o) => !o)}
              className="rounded-md border border-gray-300 text-xs py-1 px-2 text-gray-600 hover:bg-gray-50"
            >
              Metrics ({activeMetrics.size}) ▾
            </button>
            {metricsOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2 space-y-1">
                {METRICS.map((m) => (
                  <label key={m.key} className="flex items-center gap-2 text-xs text-gray-700 py-0.5 cursor-pointer">
                    <input type="checkbox" checked={activeMetrics.has(m.key)} onChange={() => toggleMetric(m.key)} className="rounded border-gray-300" />
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 min-h-[280px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">No data in this range.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={260}>
            <LineChart data={chartData} margin={{ top: 5, right: hasOrdersAxis ? 10 : 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#9ca3af" width={55} />
              {hasOrdersAxis && <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#9ca3af" width={35} allowDecimals={false} />}
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value, name) =>
                  name === 'Orders (count)' ? [value, name] : [`₱${Number(value).toLocaleString()}`, name]
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {METRICS.filter((m) => activeMetrics.has(m.key)).map((m) => (
                <Line
                  key={m.key}
                  yAxisId={m.axis === 'right' ? 'right' : 'left'}
                  type="linear"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={chartData.length <= 20}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
