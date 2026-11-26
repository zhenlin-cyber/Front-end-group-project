import { useEffect, useRef, useState } from 'react'
import { DEFAULT_CENTER, importMapsLibrary } from '../lib/maps'
import { Button, Field, Input } from './ui'
import LocationCard from './LocationCard'

// Map you can click (or search) to choose where an event happens.
// Calls onChange({ lat, lng, address, placeName }) whenever the pin moves.
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

  // Place the pin and report the new location.
  const placePin = (latLng, details) => {
    const position = { lat: latLng.lat(), lng: latLng.lng() }
    markerRef.current.setPosition(position)
    markerRef.current.setVisible(true)
    mapRef.current.panTo(position)
    onChangeRef.current({ ...position, ...details })
  }
  const placePinRef = useRef(placePin)
  useEffect(() => {
    placePinRef.current = placePin
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
        const geocoder = new Geocoder()
        mapRef.current = map
        markerRef.current = marker
        geocoderRef.current = geocoder

        // Clicking or dragging the pin looks up the address there.
        const reverseGeocode = (latLng) =>
          geocoder
            .geocode({ location: latLng })
            .then(({ results }) => results[0]?.formatted_address || '')
            .catch(() => '')
            .then((address) => placePinRef.current(latLng, { address }))
        map.addListener('click', (e) => reverseGeocode(e.latLng))
        marker.addListener('dragend', (e) => reverseGeocode(e.latLng))
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
    setSearching(true)
    setSearchError('')
    try {
      const { results } = await geocoderRef.current.geocode({
        address: query,
        // Prefer results near where the map is looking.
        bounds: mapRef.current.getBounds() || undefined,
      })
      const top = results[0]
      if (!top) throw new Error('no results')
      mapRef.current.setZoom(16)
      placePin(top.geometry.location, {
        address: top.formatted_address,
        placeName: top.types.includes('street_address') ? '' : query.trim(),
      })
    } catch {
      setSearchError("Couldn't find that place. Try a full address, or click the map.")
    } finally {
      setSearching(false)
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
