import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/authContext'
import { getUserProfile } from '../lib/users'
import { GOING, INTERESTED, removeRsvp, rsvpStatus, setRsvp } from '../lib/rsvps'
import {
  BackLink,
  Body,
  Button,
  ButtonGroup,
  Card,
  DateTile,
  InfoRow,
  Label,
  MediaFrame,
  PeopleList,
  Person,
  Tile,
  Title,
} from '../components/ui'

// "3-5 PM", "11 AM-1 PM", "6:30-8 PM"
function formatTimeRange(start, end) {
  const part = (d) => {
    const h = d.getHours() % 12 || 12
    const m = d.getMinutes()
    return m ? `${h}:${String(m).padStart(2, '0')}` : `${h}`
  }
  const meridiem = (d) => (d.getHours() < 12 ? 'AM' : 'PM')
  if (!end) return `${part(start)} ${meridiem(start)}`
  if (meridiem(start) === meridiem(end)) return `${part(start)}-${part(end)} ${meridiem(end)}`
  return `${part(start)} ${meridiem(start)}-${part(end)} ${meridiem(end)}`
}

// RSVP docs carry a copy of the name/photo so signed-out visitors can see them.
const toPerson = (r) => ({ uid: r.userId, name: r.displayName || 'Link Up member', photoURL: r.photoURL })

export default function EventDetails() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const [eventResult, setEventResult] = useState({ eventId: null, status: 'loading' })
  const [rsvps, setRsvps] = useState([])
  const [host, setHost] = useState(null)
  const [saving, setSaving] = useState(false)
  const [rsvpError, setRsvpError] = useState('')

  useEffect(() => {
    const unsubEvent = onSnapshot(
      doc(db, 'events', eventId),
      (snap) =>
        setEventResult(
          snap.exists()
            ? { eventId, status: 'ready', event: { id: snap.id, ...snap.data() } }
            : { eventId, status: 'not-found' },
        ),
      (err) => {
        console.error(err)
        setEventResult({ eventId, status: 'error' })
      },
    )
    const unsubRsvps = onSnapshot(
      query(collection(db, 'rsvps'), where('eventId', '==', eventId)),
      (snap) => setRsvps(snap.docs.map((d) => d.data())),
      (err) => console.error('RSVP listener failed:', err),
    )
    return () => {
      unsubEvent()
      unsubRsvps()
    }
  }, [eventId])

  const status = eventResult.eventId === eventId ? eventResult.status : 'loading'
  const event = eventResult.event
  const hostId = status === 'ready' ? event.hostId : null

  // users/{uid} is only readable when signed in, so signed-out visitors see "Host".
  useEffect(() => {
    if (!hostId || !user) return
    let cancelled = false
    getUserProfile(hostId)
      .then((p) => !cancelled && setHost(p))
      .catch((err) => console.error('Host lookup failed:', err))
    return () => {
      cancelled = true
    }
  }, [hostId, user])

  if (status === 'loading') return <p className="center muted">Loading event…</p>
  if (status === 'not-found') return <p className="center">This event doesn't exist.</p>
  if (status === 'error') return <p className="center error">Couldn't load this event.</p>

  const startsAt = event.startsAt?.toDate?.()
  const endsAt = event.endsAt?.toDate?.()
  const going = rsvps.filter((r) => rsvpStatus(r) === GOING)
  const interested = rsvps.filter((r) => rsvpStatus(r) === INTERESTED)
  const mine = user && rsvps.find((r) => r.userId === user.uid)
  const myStatus = mine ? rsvpStatus(mine) : null
  const capacity = event.capacity
  const isFull = capacity != null && going.length >= capacity && myStatus !== GOING
  const hostProfile = host?.uid === hostId ? host : null

  const choose = async (next) => {
    setSaving(true)
    setRsvpError('')
    try {
      if (myStatus === next) await removeRsvp(eventId, user.uid)
      else await setRsvp(eventId, user, next, Boolean(mine))
    } catch (err) {
      console.error(err)
      setRsvpError("Couldn't save your RSVP. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const mapSrc =
    event.lat != null && event.lng != null
      ? `https://maps.google.com/maps?q=${event.lat},${event.lng}&z=15&output=embed`
      : null

  return (
    <div className="event-details">
      <BackLink to="/">Back to event map</BackLink>

      <div className="ed-grid">
        <div className="ed-left">
          <MediaFrame className="ed-map">
            {mapSrc ? (
              <iframe title={`Map of ${event.locationName || 'event location'}`} src={mapSrc} loading="lazy" />
            ) : (
              <span className="muted">No location set</span>
            )}
          </MediaFrame>

          <Card className="ed-location">
            <InfoRow
              center
              leading={<Tile size={36} aria-hidden="true" />}
              title={event.locationName || 'Location TBD'}
              subtitle={event.address}
            />
          </Card>
        </div>

        <div className="ed-right">
          <Title>{event.title}</Title>

          {startsAt && (
            <InfoRow
              className="ed-when"
              leading={<DateTile date={startsAt} />}
              title={startsAt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              subtitle={formatTimeRange(startsAt, endsAt)}
            />
          )}

          <Card as="section" className="ed-rsvp">
            <Label>RSVP</Label>
            {user ? (
              <>
                <Person
                  className="ed-rsvp-me"
                  name={user.email ? `${user.displayName}, ${user.email}` : user.displayName}
                  photoURL={user.photoURL}
                />
                <ButtonGroup className="ed-rsvp-buttons">
                  <Button
                    variant={myStatus !== INTERESTED ? 'primary' : 'secondary'}
                    className="ed-btn-going"
                    aria-pressed={myStatus === GOING}
                    disabled={saving || isFull}
                    onClick={() => choose(GOING)}
                  >
                    {myStatus === GOING ? "You're going ✓" : isFull ? 'Full' : 'Going'}
                  </Button>
                  <Button
                    variant={myStatus === INTERESTED ? 'primary' : 'secondary'}
                    className="ed-btn-interested"
                    aria-pressed={myStatus === INTERESTED}
                    disabled={saving}
                    onClick={() => choose(INTERESTED)}
                  >
                    {myStatus === INTERESTED ? 'Interested ✓' : 'Interested'}
                  </Button>
                </ButtonGroup>
                {rsvpError && <p className="error">{rsvpError}</p>}
              </>
            ) : (
              <ButtonGroup className="ed-rsvp-buttons">
                <Button to="/login" variant="primary" className="ed-btn-going">
                  Sign in to RSVP
                </Button>
              </ButtonGroup>
            )}
          </Card>

          {event.description && (
            <section className="ed-section ed-description">
              <Label>Description</Label>
              <Body>{event.description}</Body>
            </section>
          )}

          <section className="ed-section ed-hosts">
            <Label>Host(s)</Label>
            <Person
              uid={event.hostId}
              name={hostProfile?.displayName || 'Host'}
              photoURL={hostProfile?.photoURL}
            />
          </section>

          <div className="ed-people-columns">
            <PeopleList
              title={capacity != null ? `Locked in (${going.length}/${capacity})` : `Locked in (${going.length})`}
              people={going.map(toPerson)}
            />
            <PeopleList title={`Interested (${interested.length})`} people={interested.map(toPerson)} />
          </div>
        </div>
      </div>
    </div>
  )
}
