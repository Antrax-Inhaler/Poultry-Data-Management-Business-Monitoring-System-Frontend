import { useId, useMemo } from 'react'

export default function SuggestInput({
  value,
  onChange,
  suggestions,
  className,
  required,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  suggestions: (string | null | undefined)[]
  className?: string
  required?: boolean
  placeholder?: string
  type?: string
}) {
  const listId = useId()
  const options = useMemo(() => {
    const set = new Set<string>()
    for (const s of suggestions) {
      if (s && s.trim()) set.add(s.trim())
    }
    return Array.from(set).sort().slice(0, 30)
  }, [suggestions])

  return (
    <>
      <input
        list={listId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
      />
      {options.length > 0 && (
        <datalist id={listId}>
          {options.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      )}
    </>
  )
}
