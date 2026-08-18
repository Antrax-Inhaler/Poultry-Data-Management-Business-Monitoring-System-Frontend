import { useMemo, useState } from 'react'

export default function SearchableSelect<T>({
  value,
  onChange,
  options,
  getValue,
  getLabel,
  placeholder,
  required,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: T[]
  getValue: (o: T) => string
  getLabel: (o: T) => string
  placeholder?: string
  required?: boolean
  className?: string
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => getLabel(o).toLowerCase().includes(q))
  }, [query, options, getLabel])

  const selectedLabel = useMemo(() => {
    const match = options.find((o) => getValue(o) === value)
    return match ? getLabel(match) : ''
  }, [options, value, getValue, getLabel])

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? (selectedLabel || 'Type to search…')}
        className={className}
        autoComplete="off"
      />
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={query ? Math.min(Math.max(filtered.length, 1) + 1, 6) : undefined}
        className={className}
      >
        <option value="">{filtered.length === 0 ? 'No matches' : 'Select…'}</option>
        {filtered.map((o) => (
          <option key={getValue(o)} value={getValue(o)}>
            {getLabel(o)}
          </option>
        ))}
      </select>
    </div>
  )
}
