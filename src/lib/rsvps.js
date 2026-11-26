import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

// RSVP status. Older RSVPs without a status count as "going".
export const GOING = 'going'
export const INTERESTED = 'interested'

export function rsvpStatus(rsvp) {
  return rsvp.status === INTERESTED ? INTERESTED : GOING
}

// Creates or updates the signed-in user's RSVP. The doc ID format is
// required by the security rules (one RSVP per person per event).
// Name/photo are copied in so signed-out visitors can see who's coming
// (users/{uid} is only readable when signed in).
// Pass `existing` when the user already has an RSVP so switching status
// doesn't reset checkedIn or createdAt.
export function setRsvp(eventId, user, status, existing = false) {
  const ref = doc(db, 'rsvps', `${eventId}_${user.uid}`)
  if (existing) return updateDoc(ref, { status })
  return setDoc(ref, {
    eventId,
    userId: user.uid,
    status,
    displayName: user.displayName || 'Anonymous',
    photoURL: user.photoURL || null,
    checkedIn: false,
    createdAt: serverTimestamp(),
  })
}

export function removeRsvp(eventId, uid) {
  return deleteDoc(doc(db, 'rsvps', `${eventId}_${uid}`))
}
