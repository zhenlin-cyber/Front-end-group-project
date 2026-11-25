import { useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../firebase'
import { ensureUserDoc } from '../lib/users'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fires on page load (restoring a saved session) and on every sign-in/out.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await ensureUserDoc(firebaseUser)
        } catch (err) {
          console.error('Could not save user profile:', err)
        }
      }
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe // clean up the listener
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
      signOut: () => firebaseSignOut(auth),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
