import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// RSVP status. Older RSVPs without a status count as "going".
export const GOING = 'going'
export const INTERESTED = 'interested'

export function rsvpStatus(rsvp) {
  return rsvp.status === INTERESTED ? INTERESTED : GOING
}

// Thrown when the last spot was taken before this RSVP went through.
export class EventFullError extends Error {
  constructor() {
    super('This event is full.')
    this.name = 'EventFullError'
  }
}

const isGoing = (snap) => snap.exists() && rsvpStatus(snap.data()) === GOING

// Each event keeps a `goingCount`. Every RSVP change updates the RSVP and the
// count in one transaction, and the security rules reject any write where the
// count doesn't match the RSVP change or would pass `capacity`. If two people
// race for the last spot, Firestore retries the slower transaction, which then
// sees the event is full.
async function changeRsvp(eventId, uid, write) {
  const eventRef = doc(db, 'events', eventId)
  const rsvpRef = doc(db, 'rsvps', `${eventId}_${uid}`)

  await runTransaction(db, async (tx) => {
    const [eventSnap, rsvpSnap] = await Promise.all([tx.get(eventRef), tx.get(rsvpRef)])
    const willGo = write(tx, rsvpRef, rsvpSnap)
    if (!eventSnap.exists()) return // event deleted; just tidy up the RSVP

    const delta = (willGo ? 1 : 0) - (isGoing(rsvpSnap) ? 1 : 0)
    if (delta === 0) return
    const { goingCount = 0, capacity = null } = eventSnap.data()
    if (delta < 0 && goingCount === 0) return // event from before goingCount existed
    if (delta > 0 && capacity != null && goingCount >= capacity) throw new EventFullError()
    tx.update(eventRef, { goingCount: goingCount + delta })
  })
}

// Creates or updates the signed-in user's RSVP. The doc ID format is
// required by the security rules (one RSVP per person per event).
// Name/photo are copied in so signed-out visitors can see who's coming
// (users/{uid} is only readable when signed in). Switching status keeps
// checkedIn and createdAt.
export function setRsvp(eventId, user, status) {
  return changeRsvp(eventId, user.uid, (tx, ref, existing) => {
    if (existing.exists()) {
      tx.update(ref, { status })
    } else {
      tx.set(ref, {
        eventId,
        userId: user.uid,
        status,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        checkedIn: false,
        createdAt: serverTimestamp(),
      })
    }
    return status === GOING
  })
}

export function removeRsvp(eventId, uid) {
  return changeRsvp(eventId, uid, (tx, ref, existing) => {
    if (existing.exists()) tx.delete(ref)
    return false
  })
}
