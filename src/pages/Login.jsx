import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = location.state?.from?.pathname || '/'

  if (user) return <Navigate to={from} replace />

  async function handleSignIn() {
    setError('')
    setBusy(true)
    try {
      await signIn()
      navigate(from, { replace: true })
    } catch (err) {
      // Closing the popup isn't really an error.
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Sign-in failed. Please try again.')
        console.error(err)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card login">
      <h1>Welcome to Link Up</h1>
      <p className="muted">Find pickup games, pottery nights, and whatever else is happening nearby.</p>
      <button className="btn primary" onClick={handleSignIn} disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
