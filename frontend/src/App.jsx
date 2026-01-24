import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/common/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EquipmentManagement from './pages/EquipmentManagement'
import TestingInterface from './pages/TestingInterface'
import TestRecords from './pages/TestRecords'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import LoadingSpinner from './components/common/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // แสดง loading แค่ครั้งเดียว
  if (loading) {
    return <LoadingSpinner />
  }

  // ถ้าไม่มี user ให้ redirect ไป login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />
  }

  // ถ้ามี user ให้แสดง children
  return children
}

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Direct Routes ไม่ให้ redirect กลับ dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <Layout>
                <EquipmentManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/testing"
          element={
            <ProtectedRoute>
              <Layout>
                <TestingInterface />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-records"
          element={
            <ProtectedRoute>
              <Layout>
                <TestRecords />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Root redirect to dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl font-bold text-gray-600">404 - Page Not Found</h1></div>} />
      </Routes>
    </div>
  )
}

export default App
