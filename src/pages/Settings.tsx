import { useEffect, useState, type FormEvent } from 'react'
import client from '../api/client'
import type { Setting } from '../api/types'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { can } = useAuth()
  const [settings, setSettings] = useState<Setting[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    client.get('/settings').then((res) => {
      const list: Setting[] = res.data.data
      setSettings(list)
      setValues(Object.fromEntries(list.map((s) => [s.key, s.value])))
    })
  }, [])

  const groups = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    acc[s.group] = acc[s.group] || []
    acc[s.group].push(s)
    return acc
  }, {})

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      await client.put('/settings', { settings: values })
      setStatus('Settings updated.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Configuration</h1>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md p-3">
        These are planning defaults, not fixed facts. Change them as your actual farm figures become known.
      </div>

      {status && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md p-3">{status}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="font-medium text-gray-800 mb-4 capitalize">{group}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((s) => (
                <div key={s.key}>
                  <label className="block text-sm text-gray-600 mb-1">{s.label ?? s.key}</label>
                  <input
                    type={s.type === 'decimal' || s.type === 'integer' ? 'number' : 'text'}
                    value={values[s.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                    className="w-full rounded-md border-gray-300 text-sm"
                    disabled={!can('settings.manage')}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {can('settings.manage') && (
          <button disabled={submitting} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
            {submitting ? 'Saving…' : 'Save Settings'}
          </button>
        )}
      </form>
    </div>
  )
}
