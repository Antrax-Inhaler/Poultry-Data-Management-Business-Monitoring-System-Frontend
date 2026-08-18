import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('That email or password was not recognized. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-8 w-full max-w-md space-y-5">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-800">&larr; Back to homepage</Link>
        <h1 className="text-2xl font-bold text-gray-800">Staff Login</h1>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-base rounded-md p-3">{error}</div>}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border-gray-300 text-lg px-3"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border-gray-300 text-lg px-3"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-800 text-white text-lg font-medium rounded-md py-3 hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
