import { collection, doc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

// Activity types, matching the board's filter chips in Figma.
export const ACTIVITY_TYPES = [
  { value: 'sports', label: 'Sports' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'nature', label: 'Nature' },
  { value: 'arts', label: 'Arts' },
]

// A fresh event ID. Pick one per form, before the first submit, and pass it to
// every createEvent attempt for that form.
export function newEventId() {
  return doc(collection(db, 'events')).id
}

// Creates events/{eventId} and returns the ID.
// Shape matches the README data model; description, address and capacity are optional.
// Posts expire when the event ends, so the board only shows what's happening now.
//
// Safe to retry with the same ID: if an earlier attempt already saved the event
// (say its reply was lost), this returns that event instead of posting a duplicate.
export async function createEvent(host, eventId, e) {
  const ref = doc(db, 'events', eventId)
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref)
    if (existing.exists()) {
      if (existing.data().hostId === host.uid) return // already posted
      throw new Error('Event ID already in use.')
    }
    tx.set(ref, {
      title: e.title,
      activityType: e.activityType,
      description: e.description || null,
      lat: e.lat,
      lng: e.lng,
      locationName: e.locationName,
      address: e.address || null,
      capacity: e.capacity ?? null,
      goingCount: 0, // kept in step with RSVPs; see lib/rsvps.js
      startsAt: Timestamp.fromDate(e.startsAt),
      endsAt: Timestamp.fromDate(e.endsAt),
      expiresAt: Timestamp.fromDate(e.endsAt),
      hostId: host.uid,
      createdAt: serverTimestamp(),
    })
  })
  return eventId
}
