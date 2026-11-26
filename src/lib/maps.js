// Loads the Google Maps JavaScript API once and shares it.
//   const { Map } = await importMapsLibrary('maps')
// Needs VITE_GOOGLE_MAPS_API_KEY with the "Maps JavaScript API" and
// "Geocoding API" enabled in Google Cloud Console.
let loading

function loadScript() {
  if (window.google?.maps?.importLibrary) return Promise.resolve()
  if (!loading) {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'))
    loading = new Promise((resolve, reject) => {
      const callback = '__linkUpMapsReady'
      window[callback] = () => {
        delete window[callback]
        resolve()
      }
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=${callback}`
      script.async = true
      script.onerror = () => {
        loading = null
        script.remove()
        reject(new Error('Google Maps failed to load'))
      }
      document.head.appendChild(script)
    })
  }
  return loading
}

export async function importMapsLibrary(name) {
  await loadScript()
  return window.google.maps.importLibrary(name)
}

// Default map center when nothing is picked yet (Berkeley).
export const DEFAULT_CENTER = { lat: 37.8715, lng: -122.273 }
