// Loads the Google Maps JavaScript API once and shares it.
//   const { Map } = await importMapsLibrary('maps')
// Needs VITE_GOOGLE_MAPS_API_KEY with the "Maps JavaScript API" and
// "Geocoding API" enabled in Google Cloud Console.
let loading

// How long to wait for the script before giving up, so a stalled request
// shows an error (with a retry) instead of loading forever.
const LOAD_TIMEOUT_MS = 15000

function loadScript() {
  if (window.google?.maps?.importLibrary) return Promise.resolve()
  if (!loading) {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'))
    loading = new Promise((resolve, reject) => {
      const callback = '__linkUpMapsReady'
      const script = document.createElement('script')
      // Clear the shared promise so the next call starts a fresh request.
      const fail = (message) => {
        clearTimeout(timer)
        loading = null
        script.remove()
        reject(new Error(message))
      }
      const timer = setTimeout(() => fail('Google Maps took too long to load'), LOAD_TIMEOUT_MS)
      // If a timed-out script finishes later, this still runs; resolving an
      // already-rejected promise does nothing, and the API is then available
      // to the next call through the check at the top.
      window[callback] = () => {
        clearTimeout(timer)
        resolve()
      }
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=${callback}`
      script.async = true
      script.onerror = () => fail('Google Maps failed to load')
      document.head.appendChild(script)
    })
  }
  return loading
}

export const hasMapsKey = () => Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

export async function importMapsLibrary(name) {
  await loadScript()
  return window.google.maps.importLibrary(name)
}

// Default map center when nothing is picked yet (Berkeley).
export const DEFAULT_CENTER = { lat: 37.8715, lng: -122.273 }
