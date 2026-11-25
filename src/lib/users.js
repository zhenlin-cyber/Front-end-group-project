import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// Creates users/{uid} on first sign-in, and keeps name/photo fresh on later ones.
// joinedAt is only written once (the security rules also stop it from changing).
export async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)

  const profile = {
    displayName: user.displayName || 'Anonymous',
    photoURL: user.photoURL || null,
  }

  if (!snap.exists()) {
    await setDoc(ref, { ...profile, joinedAt: serverTimestamp() })
  } else {
    await setDoc(ref, profile, { merge: true })
  }
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { uid, ...snap.data() } : null
}
