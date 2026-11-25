import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

// Wrap any page that needs a signed-in user:
//   <Route path="/events/new" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="center muted">Loading…</p>

  if (!user) {
    // Remember where they were going so Login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
