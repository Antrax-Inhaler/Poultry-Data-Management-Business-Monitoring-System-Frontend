import { useState } from 'react'

export function useSelection() {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll(ids: number[]) {
    setSelected((s) => {
      const allSelected = ids.length > 0 && ids.every((id) => s.has(id))
      return allSelected ? new Set() : new Set(ids)
    })
  }

  function clear() {
    setSelected(new Set())
  }

  return { selected, toggle, toggleAll, clear, isSelected: (id: number) => selected.has(id) }
}
