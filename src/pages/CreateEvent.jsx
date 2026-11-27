import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { ACTIVITY_TYPES, createEvent, newEventId } from '../lib/events'
import { BackLink, Button, ButtonGroup, ChoiceChips, Field, Input, Stack, Textarea, Title } from '../components/ui'
import LocationPicker from '../components/LocationPicker'

// yyyy-mm-dd for today, in local time (what <input type="date"> expects).
function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const EMPTY = {
  title: '',
  activityType: '',
  description: '',
  date: todayString(),
  startTime: '',
  endTime: '',
  capacity: '',
  locationName: '',
  // The place name last filled in from the map. If locationName still equals
  // it, the host hasn't typed their own, so it's safe to replace.
  autoLocationName: '',
  address: '',
  lat: null,
  lng: null,
}

// Returns { errors, event } — event is ready to save when errors is empty.
function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Give your event a name.'
  if (!form.activityType) errors.activityType = 'Pick an activity type.'
  if (form.lat == null) errors.location = 'Choose a location on the map.'
  if (!form.locationName.trim()) errors.locationName = 'Name the place so people can find it.'
  if (!form.date) errors.date = 'Pick a date.'
  if (!form.startTime) errors.startTime = 'Add a start time.'
  if (!form.endTime) errors.endTime = 'Add an end time.'

  // End times earlier than the start are treated as past midnight (e.g. 10 PM-1 AM).
  // Equal times are an error, not a 24-hour event.
  let startsAt, endsAt
  if (form.date && form.startTime && form.endTime) {
    startsAt = new Date(`${form.date}T${form.startTime}`)
    endsAt = new Date(`${form.date}T${form.endTime}`)
    if (endsAt.getTime() === startsAt.getTime()) {
      errors.endTime = 'End time must be different from the start time.'
    } else {
      if (endsAt < startsAt) endsAt.setDate(endsAt.getDate() + 1)
      if (endsAt <= new Date()) errors.endTime = 'This event would already be over.'
    }
  }

  let capacity = null
  if (form.capacity !== '') {
    capacity = Number(form.capacity)
    if (!Number.isInteger(capacity) || capacity < 2) errors.capacity = 'Use a whole number, 2 or more.'
  }

  return {
    errors,
    event: {
      title: form.title.trim(),
      activityType: form.activityType,
      description: form.description.trim(),
      lat: form.lat,
      lng: form.lng,
      locationName: form.locationName.trim(),
      address: form.address,
      capacity,
      startsAt,
      endsAt,
    },
  }
}

export default function CreateEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  // Set synchronously, so a double click can't start a second save before
  // `saving` re-renders the button as disabled.
  const savingRef = useRef(false)
  // One ID for this form: a retry after an unclear failure reuses it, so it
  // can't post the event twice.
  const [eventId] = useState(newEventId)

  // The form is locked while saving: the event is saved with what was on
  // screen at submit, so later edits would be silently lost.
  const set = (field) => (e) => {
    if (savingRef.current) return
    const value = e.target ? e.target.value : e
    setForm((f) => ({ ...f, [field]: value }))
  }

  // A save can't be called off once sent, so warn before closing or reloading
  // the tab while one is in flight. (In-page ways out are disabled below.)
  useEffect(() => {
    if (!saving) return
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [saving])

  const submit = async (e) => {
    e.preventDefault()
    const { errors: found, event } = validate(form)
    setErrors(found)
    if (Object.keys(found).length || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSubmitError('')
    try {
      await createEvent(user, eventId, event)
      navigate(`/events/${eventId}`)
    } catch (err) {
      console.error(err)
      setSubmitError("Couldn't post your event. Try again.")
      savingRef.current = false
      setSaving(false)
    }
  }

  // Shared props for a text field: value, change handler, error state.
  const fieldProps = (name) => ({
    id: name,
    value: form[name],
    onChange: set(name),
    invalid: Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-message` : undefined,
  })

  return (
    <div className="ui-page-wide">
      <BackLink to="/" disabled={saving}>Back to event map</BackLink>

      <form onSubmit={submit} noValidate>
        {/* Disabling the fieldset disables every input and button inside it. */}
        <fieldset className="ui-split ce-form" disabled={saving}>
          <LocationPicker
            value={form}
            error={errors.location}
            disabled={saving}
            onChange={({ lat, lng, address, placeName }) => {
              // A search started before submitting can finish after it.
              if (savingRef.current) return
              setForm((f) => {
                // A name the host typed stays put. An auto-filled (or empty) one
                // follows the pin: replaced by a new search result, or cleared when
                // the pin moves somewhere without a name.
                const typed = f.locationName.trim() !== '' && f.locationName !== f.autoLocationName
                return {
                  ...f,
                  lat,
                  lng,
                  address,
                  autoLocationName: placeName,
                  locationName: typed ? f.locationName : placeName,
                }
              })
            }}
          />

          <Stack>
            <Title>Post an event</Title>

            <Field label="Event name" htmlFor="title" error={errors.title}>
              <Input {...fieldProps('title')} placeholder="Pick up basketball at Precita Park" maxLength={80} />
            </Field>

            <ChoiceChips
              label="Activity"
              options={ACTIVITY_TYPES}
              value={form.activityType}
              onChange={set('activityType')}
              error={errors.activityType}
            />

            <Field
              label="Place name"
              htmlFor="locationName"
              hint="Shown on the event, e.g. “Berkeley Bowl Marketplace”."
              error={errors.locationName}
            >
              <Input {...fieldProps('locationName')} maxLength={80} />
            </Field>

            <div className="ui-field-row">
              <Field label="Date" htmlFor="date" error={errors.date}>
                <Input {...fieldProps('date')} type="date" min={todayString()} />
              </Field>
              <Field label="Starts" htmlFor="startTime" error={errors.startTime}>
                <Input {...fieldProps('startTime')} type="time" />
              </Field>
              <Field label="Ends" htmlFor="endTime" error={errors.endTime}>
                <Input {...fieldProps('endTime')} type="time" />
              </Field>
            </div>

            <Field
              label="Spots (optional)"
              htmlFor="capacity"
              hint="Leave blank for no limit."
              error={errors.capacity}
            >
              <Input {...fieldProps('capacity')} type="number" inputMode="numeric" min={2} step={1} />
            </Field>

            <Field label="Description (optional)" htmlFor="description">
              <Textarea
                {...fieldProps('description')}
                maxLength={500}
                placeholder="Who's it for, what to bring, how to find you…"
              />
            </Field>

            <div>
              <ButtonGroup fill className="ce-actions">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Posting…' : 'Post event'}
                </Button>
                <Button onClick={() => navigate('/')}>Cancel</Button>
              </ButtonGroup>
              {submitError && <p className="error" role="alert">{submitError}</p>}
            </div>
          </Stack>
        </fieldset>
      </form>
    </div>
  )
}
