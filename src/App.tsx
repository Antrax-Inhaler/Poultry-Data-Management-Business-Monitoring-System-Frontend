import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BatchList from './pages/BatchList'
import BatchCreate from './pages/BatchCreate'
import BatchDetail from './pages/BatchDetail'
import CustomerList from './pages/CustomerList'
import CustomerCreate from './pages/CustomerCreate'
import CustomerDetail from './pages/CustomerDetail'
import CustomerEdit from './pages/CustomerEdit'
import OrderList from './pages/OrderList'
import OrderCreate from './pages/OrderCreate'
import OrderDetail from './pages/OrderDetail'
import OrderEdit from './pages/OrderEdit'
import ExpenseList from './pages/ExpenseList'
import FeedList from './pages/FeedList'
import InventoryList from './pages/InventoryList'
import InventoryDetail from './pages/InventoryDetail'
import Settings from './pages/Settings'
import AuditLog from './pages/AuditLog'
import Reports from './pages/Reports'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/batches" element={<BatchList />} />
            <Route path="/batches/new" element={<BatchCreate />} />
            <Route path="/batches/:id" element={<BatchDetail />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerCreate />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerEdit />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/new" element={<OrderCreate />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/:id/edit" element={<OrderEdit />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/feed" element={<FeedList />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/:id" element={<InventoryDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
