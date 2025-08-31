import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthForm from './components/AuthForm'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import LandingPage from './pages/LandingPage'
import Debug from './pages/Debug'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/u/:slug" element={<LandingPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthForm />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/analytics/:linkId"
        element={
          user ? (
            <Analytics />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/debug"
        element={
          user ? (
            <Debug />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Redirect root to dashboard or login */}
      <Route
        path="/"
        element={
          <Navigate to={user ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
