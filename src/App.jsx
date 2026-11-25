import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="container">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Placeholder title="Event board" owner="Persons 2 & 3" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/events/:eventId" element={<Placeholder title="Event details" owner="Person 3" />} />

            {/* Signed-in only */}
            <Route
              path="/profile/:uid"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="/events/new"
              element={<ProtectedRoute><Placeholder title="Post an event" owner="Person 3" /></ProtectedRoute>}
            />
            <Route
              path="/my-events"
              element={<ProtectedRoute><Placeholder title="My past events" owner="Person 4" /></ProtectedRoute>}
            />

            <Route path="*" element={<p className="center">Page not found.</p>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}
