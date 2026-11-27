import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { EventLocations } from '../components/EventMap'
import { Title } from '../components/ui'
import { db } from '../firebase'

function hasCoordinates({ lat, lng }) {
  return Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    Number.isFinite(lng) && Math.abs(lng) <= 180
}

export default function EventBoard() {
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const stop = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        setNow(Date.now())
        setEvents(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      },
      (err) => {
        console.error('Event board listener failed:', err)
        setError(true)
      },
    )
    return stop
  }, [])

  const nextExpiration = events?.reduce((next, event) => {
    const expiresAt = event.expiresAt?.toMillis?.()
    return expiresAt > now ? Math.min(next, expiresAt) : next
  }, Infinity)
  useEffect(() => {
    if (!Number.isFinite(nextExpiration)) return
    const delay = Math.min(Math.max(0, nextExpiration - Date.now()), 2_147_483_647)
    const timer = window.setTimeout(() => setNow(Date.now()), delay)
    return () => window.clearTimeout(timer)
  }, [nextExpiration, now])

  const [eventList, mappedEvents] = useMemo(() => {
    const active = (events || []).filter((event) => (event.expiresAt?.toMillis?.() ?? Infinity) > now)
    return [active, active.filter(hasCoordinates)]
  }, [events, now])

  return (
    <section className="event-board">
      <Title>Event map</Title>
      {error ? (
        <p role="status" className="error">Couldn't load events. Refresh to try again.</p>
      ) : events === null ? (
        <p role="status" className="muted">Loading events…</p>
      ) : (
        <>
          {eventList.length > 0 ? (
            <>
              <EventLocations events={mappedEvents} />
              <h2>Events</h2>
              <ul className="event-board-list">
                {eventList.map((event) => (
                  <li key={event.id}>
                    <Link to={`/events/${encodeURIComponent(event.id)}`}>{event.title || 'Link Up event'}</Link>
                    {event.locationName && <div className="muted">{event.locationName}</div>}
                  </li>
                ))}
              </ul>
            </>
          ) : <p className="muted">No upcoming events yet.</p>}
        </>
      )}
    </section>
  )
}
