import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '../firebase'

// Badge tiers. Positive-only: we never store or show no-shows.
export const TIERS = [
  { min: 20, label: 'Local Fixture' },
  { min: 5, label: 'Regular' },
  { min: 0, label: 'New' },
]

export function tierFor(attendedCount) {
  return TIERS.find((t) => attendedCount >= t.min).label
}

// Cache so a list of 20 RSVPs doesn't re-query the same user on every render.
// Each count query costs 1 read, regardless of how many records it counts.
const statsCache = new Map()

export function getUserStats(uid) {
  if (!statsCache.has(uid)) {
    const promise = Promise.all([
      getCountFromServer(query(collection(db, 'attendance'), where('userId', '==', uid))),
      getCountFromServer(query(collection(db, 'events'), where('hostId', '==', uid))),
    ])
      .then(([attended, hosted]) => {
        const attendedCount = attended.data().count
        return {
          attended: attendedCount,
          hosted: hosted.data().count,
          tier: tierFor(attendedCount),
        }
      })
      .catch((err) => {
        statsCache.delete(uid) // let it retry next time
        throw err
      })
    statsCache.set(uid, promise)
  }
  return statsCache.get(uid)
}

// Call after a host confirms attendance or someone posts an event,
// so the next badge render shows the new number.
export function clearUserStats(uid) {
  statsCache.delete(uid)
}
