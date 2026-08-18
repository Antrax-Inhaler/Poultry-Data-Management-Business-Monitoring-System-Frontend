import { useState } from 'react'
import client from '../api/client'
import ConfirmDialog from './ConfirmDialog'

export default function BulkActionsBar({
  endpoint,
  selectedIds,
  onDone,
  label = 'record(s)',
}: {
  endpoint: string
  selectedIds: number[]
  onDone: () => void
  label?: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (selectedIds.length === 0) return null

  async function handleDelete() {
    setBusy(true)
    setError(null)
    try {
      await client.delete(endpoint, { data: { ids: selectedIds } })
      setConfirming(false)
      onDone()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to delete selected records.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5">
        <span>{selectedIds.length} {label} selected</span>
        <button onClick={() => setConfirming(true)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md">
          Delete Selected
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mt-2">{error}</div>}
      <ConfirmDialog
        open={confirming}
        title="Delete selected records?"
        message={`This will archive ${selectedIds.length} ${label}. This action cannot be undone from here.`}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}
