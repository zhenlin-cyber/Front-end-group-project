import { Card, InfoRow, MediaFrame, Tile } from './ui'

// Map + place name/address in one card. Used on event details and create event.
//   <LocationCard map={<iframe … />} title="Berkeley Bowl" subtitle="1234 Market St" />
// `children` render below the place info (e.g. a search field on the create page).
export default function LocationCard({ map, title, subtitle, children }) {
  return (
    <Card className="location-card">
      <MediaFrame className="location-card__map">{map}</MediaFrame>
      <InfoRow leading={<Tile size={36} aria-hidden="true" />} title={title} subtitle={subtitle} />
      {children}
    </Card>
  )
}
