import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// Usage in any component:
//   const { user, loading, signIn, signOut } = useAuth()
// `user` is the Firebase user (user.uid, user.displayName, user.photoURL) or null.
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
