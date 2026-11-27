import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { googleMapsKey, loadGoogleMaps } from '../lib/googleMaps'

const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim() || 'DEMO_MAP_ID'

export default function EventMap({ events }) {
  const container = useRef(null)
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    const markers = []
    const mapElement = document.createElement('div')
    mapElement.className = 'event-board-map-canvas'
    container.current.append(mapElement)

    async function showMap() {
      const maps = await loadGoogleMaps()
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        maps.importLibrary('maps'),
        maps.importLibrary('marker'),
      ])
      if (cancelled) return

      const center = { lat: events[0].lat, lng: events[0].lng }
      const map = new Map(mapElement, { center, zoom: 15, mapId })
      const bounds = new maps.LatLngBounds()
      const locations = new Set()

      for (const event of events) {
        const position = { lat: event.lat, lng: event.lng }
        bounds.extend(position)
        locations.add(`${event.lat},${event.lng}`)

        const marker = new AdvancedMarkerElement({
          map,
          position,
          title: event.title || 'Link Up event',
          gmpClickable: true,
        })
        const openEvent = () => navigate(`/events/${encodeURIComponent(event.id)}`)
        marker.addEventListener('gmp-click', openEvent)
        markers.push({ marker, openEvent })
      }

      if (locations.size > 1) map.fitBounds(bounds, 48)
      setStatus('ready')
    }

    showMap().catch((error) => {
      if (cancelled) return
      console.error(error)
      setStatus('error')
    })

    return () => {
      cancelled = true
      for (const { marker, openEvent } of markers) {
        marker.removeEventListener('gmp-click', openEvent)
        marker.map = null
      }
      mapElement.remove()
    }
  }, [events, navigate])

  return (
    <>
      {status === 'loading' && <p role="status" className="muted">Loading map…</p>}
      {status === 'error' && <p role="status" className="muted">Google Maps is unavailable. You can still browse events below.</p>}
      <div ref={container} className="event-board-map" aria-label="Event locations" role="region" hidden={status === 'error'} />
    </>
  )
}

export function EventLocations({ events }) {
  if (events.length === 0) return <p className="muted">No events with mapped locations yet.</p>
  if (!googleMapsKey) return <p className="muted">The event map is unavailable. Browse events below.</p>
  return <EventMap events={events} />
}
