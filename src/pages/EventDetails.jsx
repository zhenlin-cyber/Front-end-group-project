import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/authContext'
import { getUserProfile } from '../lib/users'
import { readEvent } from '../lib/events'
import { EventFullError, GOING, INTERESTED, removeRsvp, rsvpStatus, setRsvp } from '../lib/rsvps'
import {
  BackLink,
  Body,
  Button,
  ButtonGroup,
  Card,
  DateTile,
  InfoRow,
  Label,
  PeopleList,
  Person,
  Section,
  Stack,
  Title,
} from '../components/ui'
import LocationCard from '../components/LocationCard'

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
// Only strings are used, so a malformed RSVP can't break the page.
const text = (v) => (typeof v === 'string' ? v : '')
const toPerson = (r) => ({
  uid: text(r.userId) || undefined,
  name: text(r.displayName) || 'Link Up member',
  photoURL: text(r.photoURL) || null,
})

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
            ? { eventId, status: 'ready', event: readEvent(snap) }
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

  const { startsAt, endsAt } = event
  const going = rsvps.filter((r) => rsvpStatus(r) === GOING)
  const interested = rsvps.filter((r) => rsvpStatus(r) === INTERESTED)
  const mine = user && rsvps.find((r) => r.userId === user.uid)
  const myStatus = mine ? rsvpStatus(mine) : null
  const capacity = event.capacity
  // goingCount is the server's count (what the rules enforce); fall back to the
  // list for events created before it existed.
  const goingCount = event.goingCount ?? going.length
  const isFull = capacity != null && goingCount >= capacity && myStatus !== GOING
  const hostProfile = host?.uid === hostId ? host : null

  const choose = async (next) => {
    setSaving(true)
    setRsvpError('')
    try {
      if (myStatus === next) await removeRsvp(eventId, user.uid)
      else await setRsvp(eventId, user, next)
    } catch (err) {
      if (err instanceof EventFullError) {
        setRsvpError('Sorry, the last spot was just taken.')
      } else {
        console.error(err)
        setRsvpError("Couldn't save your RSVP. Try again.")
      }
    } finally {
      setSaving(false)
    }
  }

  const mapSrc =
    event.lat != null && event.lng != null
      ? `https://maps.google.com/maps?q=${event.lat},${event.lng}&z=15&output=embed`
      : null

  return (
    <div className="ui-page-wide">
      <BackLink to="/">Back to event map</BackLink>

      <div className="ui-split">
        <LocationCard
          map={
            mapSrc ? (
              <iframe title={`Map of ${event.locationName || 'event location'}`} src={mapSrc} loading="lazy" />
            ) : (
              <span className="muted">No location set</span>
            )
          }
          title={event.locationName || 'Location TBD'}
          subtitle={event.address}
        />

        <Stack>
          <Title>{event.title}</Title>

          {startsAt && (
            <InfoRow
              leading={<DateTile date={startsAt} />}
              title={startsAt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              subtitle={formatTimeRange(startsAt, endsAt)}
            />
          )}

          <Card as="section">
            <Label>RSVP</Label>
            {user ? (
              <>
                <Person
                  name={user.email ? `${user.displayName}, ${user.email}` : user.displayName}
                  photoURL={user.photoURL}
                />
                <ButtonGroup fill>
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
              <ButtonGroup fill>
                <Button to="/login" variant="primary">
                  Sign in to RSVP
                </Button>
              </ButtonGroup>
            )}
          </Card>

          {event.description && (
            <Section title="Description">
              <Body>{event.description}</Body>
            </Section>
          )}

          <Section title="Host(s)">
            <Person
              uid={event.hostId}
              name={hostProfile?.displayName || 'Host'}
              photoURL={hostProfile?.photoURL}
            />
          </Section>

          <div className="ed-people-columns">
            <PeopleList
              title={capacity != null ? `Going (${going.length}/${capacity})` : `Going (${going.length})`}
              people={going.map(toPerson)}
            />
            <PeopleList title={`Interested (${interested.length})`} people={interested.map(toPerson)} />
          </div>
        </Stack>
      </div>
    </div>
  )
}
