interface PaginationMeta {
  current_page: number
  last_page: number
  total: number
}

export default function Pagination({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (page: number) => void }) {
  if (meta.last_page <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, meta.current_page - 2)
  const end = Math.min(meta.last_page, meta.current_page + 2)
  for (let p = start; p <= end; p++) pages.push(p)

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm text-sm">
      <span className="text-gray-500">
        Page {meta.current_page} of {meta.last_page} · {meta.total} total
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          Prev
        </button>
        {start > 1 && <span className="px-2 py-1 text-gray-400">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-md ${p === meta.current_page ? 'bg-gray-800 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
          >
            {p}
          </button>
        ))}
        {end < meta.last_page && <span className="px-2 py-1 text-gray-400">…</span>}
        <button
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="px-3 py-1 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
