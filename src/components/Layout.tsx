import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from './ConfirmDialog'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', permission: null },
  { to: '/batches', label: 'Batches', permission: 'batches.view' },
  { to: '/feed', label: 'Feed', permission: 'feed.view' },
  { to: '/inventory', label: 'Inventory', permission: 'inventory.view' },
  { to: '/customers', label: 'Customers', permission: 'customers.view' },
  { to: '/orders', label: 'Orders', permission: 'orders.view' },
  { to: '/expenses', label: 'Expenses', permission: 'expenses.view' },
  { to: '/reports', label: 'Reports', permission: 'reports.view' },
]

const accountItems = [
  { to: '/settings', label: 'Configuration', permission: 'settings.view' },
  { to: '/audit-log', label: 'Audit Log', permission: 'audit.view' },
]

export default function Layout() {
  const { user, logout, can } = useAuth()
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
      setConfirmingLogout(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row: brand + account. Always visible, no hidden-on-mobile nav. */}
          <div className="flex flex-wrap justify-between items-center gap-3 py-3">
            <span className="text-lg font-bold text-gray-800">PDMBMS</span>
            <div className="flex flex-wrap items-center gap-4">
              {accountItems
                .filter((item) => can(item.permission))
                .map((item) => (
                  <NavLink key={item.to} to={item.to} className="text-base text-gray-600 hover:text-gray-900 py-2">
                    {item.label}
                  </NavLink>
                ))}
              <span className="text-base text-gray-600">{user?.name}</span>
              <button
                onClick={() => setConfirmingLogout(true)}
                className="px-4 py-2 text-base rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Log out
              </button>
            </div>
          </div>

          {/* Nav row: wraps instead of disappearing, large tappable pills. */}
          <div className="flex flex-wrap gap-2 pb-3">
            {navItems
              .filter((item) => !item.permission || can(item.permission))
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-base font-medium ${
                      isActive ? 'bg-gray-800 text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <ConfirmDialog
        open={confirmingLogout}
        title="Log out?"
        message="You'll need to sign in again to access the system."
        confirmLabel="Log out"
        danger={false}
        busy={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  )
}
