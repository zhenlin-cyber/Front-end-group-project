import { useEffect, useRef, useState } from 'react'
import { DEFAULT_CENTER, importMapsLibrary } from '../lib/maps'
import { Button, Field, Input } from './ui'
import LocationCard from './LocationCard'

// Map you can click (or search) to choose where an event happens.
// Calls onChange({ lat, lng, address, placeName }) whenever the pin moves.
// placeName is the searched name, or '' when the pin was clicked or dragged.
export default function LocationPicker({ value, onChange, error }) {
  const canvasRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const geocoderRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    onChangeRef.current = onChange
  })

  // Every click, drag or search is a new selection. Geocoding is async, so a
  // slow lookup for an older selection can finish after a newer one; results
  // are only applied if their selection is still the latest.
  const selectionRef = useRef(0)
  const startSelection = () => ++selectionRef.current
  const isCurrent = (id) => id === selectionRef.current

  // Move the pin and report the new location.
  const placePin = (latLng, details) => {
    const position = { lat: latLng.lat(), lng: latLng.lng() }
    markerRef.current.setPosition(position)
    markerRef.current.setVisible(true)
    mapRef.current.panTo(position)
    onChangeRef.current({ ...position, ...details })
  }

  // Clicking the map or dragging the pin: move the pin right away, then fill
  // in the address once the lookup returns, unless the host has moved on.
  const selectPoint = (latLng) => {
    const id = startSelection()
    setSearchError('')
    setSearching(false) // any search still running is now out of date
    // A dropped pin has no place name, so any name from an earlier search no
    // longer applies.
    placePin(latLng, { address: '', placeName: '' })
    geocoderRef.current
      .geocode({ location: latLng })
      .then(({ results }) => results[0]?.formatted_address || '')
      .catch(() => '')
      .then((address) => {
        if (isCurrent(id) && address) placePin(latLng, { address, placeName: '' })
      })
  }
  // The map listeners are attached once, so they call through a ref to get
  // the latest selectPoint.
  const selectPointRef = useRef(selectPoint)
  useEffect(() => {
    selectPointRef.current = selectPoint
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([importMapsLibrary('maps'), importMapsLibrary('marker'), importMapsLibrary('geocoding')])
      .then(([{ Map }, { Marker }, { Geocoder }]) => {
        if (cancelled) return
        const map = new Map(canvasRef.current, {
          center: DEFAULT_CENTER,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        })
        const marker = new Marker({ map, visible: false, draggable: true })
        mapRef.current = map
        markerRef.current = marker
        geocoderRef.current = new Geocoder()

        map.addListener('click', (e) => selectPointRef.current(e.latLng))
        marker.addListener('dragend', (e) => selectPointRef.current(e.latLng))
        setStatus('ready')
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const search = async () => {
    if (!query.trim() || status !== 'ready') return
    const id = startSelection()
    setSearching(true)
    setSearchError('')
    try {
      const { results } = await geocoderRef.current.geocode({
        address: query,
        // Prefer results near where the map is looking.
        bounds: mapRef.current.getBounds() || undefined,
      })
      if (!isCurrent(id)) return // host clicked, dragged or searched again meanwhile
      const top = results[0]
      if (!top) throw new Error('no results')
      mapRef.current.setZoom(16)
      placePin(top.geometry.location, {
        address: top.formatted_address,
        placeName: top.types.includes('street_address') ? '' : query.trim(),
      })
    } catch {
      if (isCurrent(id)) setSearchError("Couldn't find that place. Try a full address, or click the map.")
    } finally {
      if (isCurrent(id)) setSearching(false)
    }
  }

  const map =
    status === 'error' ? (
      <span className="muted">Map unavailable. Set VITE_GOOGLE_MAPS_API_KEY in .env to choose a location.</span>
    ) : (
      <div ref={canvasRef} className="location-card__canvas" />
    )

  return (
    <LocationCard
      map={map}
      title={value.locationName || (value.lat != null ? 'Pinned location' : 'No location yet')}
      subtitle={value.address || 'Search below or click the map to drop a pin.'}
    >
      <Field label="Find a place" htmlFor="location-search" error={searchError || error}>
        <div className="location-search">
          <Input
            id="location-search"
            type="search"
            placeholder="e.g. Berkeley Bowl or 2020 Oregon St"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // Lives inside the page's form, so Enter searches instead of submitting it.
              if (e.key === 'Enter') {
                e.preventDefault()
                search()
              }
            }}
            invalid={Boolean(searchError || error)}
            aria-describedby={searchError || error ? 'location-search-message' : undefined}
            disabled={status !== 'ready'}
          />
          <Button onClick={search} disabled={searching || status !== 'ready'}>
            {searching ? 'Searching…' : 'Search'}
          </Button>
        </div>
      </Field>
    </LocationCard>
  )
}
