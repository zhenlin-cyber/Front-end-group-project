let mapsPromise

export const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()

export function loadGoogleMaps() {
  if (!mapsPromise) {
    mapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      const callback = 'linkUpMapsReady'
      const params = new URLSearchParams({
        key: googleMapsKey,
        loading: 'async',
        callback,
        v: 'weekly',
      })

      window[callback] = () => {
        delete window[callback]
        resolve(window.google.maps)
      }
      script.onerror = () => {
        delete window[callback]
        script.remove()
        mapsPromise = undefined
        reject(new Error('Google Maps failed to load'))
      }
      script.async = true
      script.src = `https://maps.googleapis.com/maps/api/js?${params}`
      document.head.append(script)
    })
  }
  return mapsPromise
}
