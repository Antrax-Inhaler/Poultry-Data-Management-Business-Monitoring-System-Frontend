import { useEffect, useState } from 'react'
import client from '../api/client'
import type { Batch } from '../api/types'

const TABS = ['Batches', 'Sales', 'Expenses', 'Feed', 'Financial', 'DTI Evidence', 'Detailed PDF Report'] as const
type Tab = (typeof TABS)[number]

export default function Reports() {
  const [tab, setTab] = useState<Tab>('Batches')

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Reports</h1>
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm rounded-md ${tab === t ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Batches' && <BatchesReport />}
      {tab === 'Sales' && <DateRangeReport endpoint="/reports/sales" render={SalesReport} />}
      {tab === 'Expenses' && <DateRangeReport endpoint="/reports/expenses" render={ExpensesReport} />}
      {tab === 'Feed' && <DateRangeReport endpoint="/reports/feed" render={FeedReport} />}
      {tab === 'Financial' && <DateRangeReport endpoint="/reports/financial" render={FinancialReport} />}
      {tab === 'DTI Evidence' && <DtiEvidenceReport />}
      {tab === 'Detailed PDF Report' && <DetailedPdfReport />}
    </div>
  )
}

function BatchesReport() {
  const [batches, setBatches] = useState<Batch[]>([])
  useEffect(() => {
    client.get('/reports/batches').then((res) => setBatches(res.data.data))
  }, [])

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-2">Batch</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Mortality %</th>
            <th className="px-4 py-2">FCR</th><th className="px-4 py-2">Revenue</th><th className="px-4 py-2">Cost</th><th className="px-4 py-2">Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {batches.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No batches recorded yet.</td></tr>
          ) : (
            batches.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2">{b.batch_code}</td>
                <td className="px-4 py-2">{b.status}</td>
                <td className="px-4 py-2">{b.mortality_rate}%</td>
                <td className="px-4 py-2">{b.fcr > 0 ? b.fcr : '—'}</td>
                <td className="px-4 py-2">₱{b.total_revenue.toLocaleString()}</td>
                <td className="px-4 py-2">₱{b.total_cost.toLocaleString()}</td>
                <td className={`px-4 py-2 ${b.gross_margin < 0 ? 'text-red-600' : 'text-green-600'}`}>₱{b.gross_margin.toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function DateRangeReport({ endpoint, render: Render }: { endpoint: string; render: (data: any) => React.ReactElement }) {
  const [from, setFrom] = useState(() => new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10))
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [data, setData] = useState<any>(null)

  function load() {
    client.get(endpoint, { params: { from, to } }).then((res) => setData(res.data))
  }

  useEffect(load, [endpoint])

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border-gray-300 text-sm" />
        </div>
        <button onClick={load} className="px-4 py-2 bg-gray-100 text-sm rounded-md hover:bg-gray-200">Apply</button>
      </div>
      {data ? <Render {...data} /> : <div className="text-gray-400">Loading…</div>}
    </div>
  )
}

function SalesReport({ total_revenue, total_orders, by_product, by_customer, daily }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Total Revenue" value={`₱${total_revenue.toLocaleString()}`} />
        <Stat label="Total Orders" value={total_orders} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Table title="By Product" rows={Object.entries(by_product)} cols={['Product', 'Orders', 'Revenue']}
          render={([k, v]: any) => [k, v.count, `₱${v.revenue.toLocaleString()}`]} />
        <Table title="By Customer" rows={by_customer} cols={['Customer', 'Orders', 'Revenue']}
          render={(v: any) => [v.customer, v.orders, `₱${v.revenue.toLocaleString()}`]} />
      </div>
      <Table title="Daily Revenue" rows={Object.entries(daily)} cols={['Date', 'Revenue']}
        render={([k, v]: any) => [k, `₱${Number(v).toLocaleString()}`]} />
    </div>
  )
}

function ExpensesReport({ total_expenses, by_category, by_month, by_batch }: any) {
  return (
    <div className="space-y-4">
      <Stat label="Total Expenses" value={`₱${total_expenses.toLocaleString()}`} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Table title="By Category" rows={Object.entries(by_category)} cols={['Category', 'Total']}
          render={([k, v]: any) => [k, `₱${Number(v).toLocaleString()}`]} />
        <Table title="By Month" rows={Object.entries(by_month)} cols={['Month', 'Total']}
          render={([k, v]: any) => [k, `₱${Number(v).toLocaleString()}`]} />
      </div>
      <Table title="By Batch" rows={by_batch} cols={['Batch', 'Total']}
        render={(v: any) => [v.batch, `₱${v.total.toLocaleString()}`]} />
    </div>
  )
}

function FeedReport({ total_kg, total_cost, by_type, by_batch }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Total Feed" value={`${total_kg} kg`} />
        <Stat label="Total Cost" value={`₱${total_cost.toLocaleString()}`} />
      </div>
      <Table title="By Type" rows={Object.entries(by_type)} cols={['Type', 'Sacks', 'Kg', 'Cost']}
        render={([k, v]: any) => [k, v.sacks, v.kg, `₱${v.cost.toLocaleString()}`]} />
      <Table title="By Batch" rows={by_batch} cols={['Batch', 'Kg', 'Cost', 'FCR']}
        render={(v: any) => [v.batch, v.kg, `₱${v.cost.toLocaleString()}`, v.fcr]} />
    </div>
  )
}

function FinancialReport({ revenue, expenses, profit, margin_pct }: any) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat label="Revenue" value={`₱${revenue.toLocaleString()}`} />
      <Stat label="Expenses" value={`₱${expenses.toLocaleString()}`} />
      <Stat label="Profit" value={`₱${profit.toLocaleString()}`} warn={profit < 0} />
      <Stat label="Margin" value={`${margin_pct}%`} />
    </div>
  )
}

function DtiEvidenceReport() {
  const [from, setFrom] = useState(() => new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10))
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [data, setData] = useState<any>(null)
  const [printing, setPrinting] = useState(false)

  function load() {
    client.get('/reports/dti-evidence', { params: { from, to } }).then((res) => setData(res.data))
  }

  useEffect(load, [])

  async function handlePrint() {
    setPrinting(true)
    try {
      const res = await client.get('/reports/dti-evidence/print', { params: { from, to } })
      const win = window.open('', '_blank')
      if (win) {
        win.document.open()
        win.document.write(res.data.html)
        win.document.close()
        win.focus()
        win.print()
      }
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border-gray-300 text-sm" />
        </div>
        <button onClick={load} className="px-4 py-2 bg-gray-100 text-sm rounded-md hover:bg-gray-200">Apply</button>
        <button onClick={handlePrint} disabled={printing} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
          {printing ? 'Preparing…' : 'Print / Save as PDF'}
        </button>
      </div>
      {data ? <DtiReport {...data} /> : <div className="text-gray-400">Loading…</div>}
    </div>
  )
}

function DetailedPdfReport() {
  const [from, setFrom] = useState(() => new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10))
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  async function handleDownload() {
    setDownloading(true)
    setError('')
    try {
      const res = await client.get('/reports/detailed/pdf', {
        params: { from, to },
        responseType: 'blob',
      })
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `Detailed-Business-Report-${from}-to-${to}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch {
      setError('Could not generate the report. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="font-medium text-gray-800">Detailed Business Report (PDF)</h3>
        <p className="text-sm text-gray-500 mt-1">
          A single branded PDF covering the executive summary, financial trend, batch production detail,
          sales, expenses, feed efficiency, and customer reorder forecast for the selected period —
          letterheaded with the full company logo.
        </p>

        <div className="flex flex-wrap gap-3 items-end mt-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border-gray-300 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border-gray-300 text-sm" />
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {downloading ? 'Generating…' : 'Download PDF Report'}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  )
}

function DtiReport(data: any) {
  const items: [string, string | number][] = [
    ['Completed Batches', data.completed_batch_count],
    ['Total Birds Raised', data.total_birds_raised],
    ['Total Birds Sold', data.total_birds_sold],
    ['Avg. Mortality', `${data.avg_mortality}%`],
    ['Avg. Market Weight', `${data.avg_weight} kg`],
    ['Total Revenue', `₱${data.revenue.toLocaleString()}`],
    ['Avg. Revenue/Batch', `₱${data.avg_revenue_per_batch.toLocaleString()}`],
    ['Total Expenses', `₱${data.expense_total.toLocaleString()}`],
    ['Avg. Margin', `${data.avg_margin_pct}%`],
    ['Active Customers', data.customer_count],
    ['Recurring Customers', data.recurring_customers],
  ]
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <p className="text-xs text-gray-400 mb-4">
        All figures below are drawn directly from system records for {data.from} – {data.to}.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        {items.map(([label, value]) => (
          <div key={label}>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
          </div>
        ))}
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

function Table({ title, rows, cols, render }: { title: string; rows: any[]; cols: string[]; render: (row: any) => (string | number)[] }) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b font-medium text-gray-800">{title}</div>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>{cols.map((c) => <th key={c} className="px-4 py-2">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} className="px-4 py-6 text-center text-gray-400">No data for this period.</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>{render(row).map((v, j) => <td key={j} className="px-4 py-2">{v}</td>)}</tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
