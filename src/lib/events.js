import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

// Activity types, matching the board's filter chips in Figma.
export const ACTIVITY_TYPES = [
  { value: 'sports', label: 'Sports' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'nature', label: 'Nature' },
  { value: 'arts', label: 'Arts' },
]

// Creates events/{auto-id} and returns the new ID.
// Shape matches the README data model; description, address and capacity are optional.
// Posts expire when the event ends, so the board only shows what's happening now.
export async function createEvent(host, e) {
  const ref = await addDoc(collection(db, 'events'), {
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
  return ref.id
}
