// Leading tile + bold title + optional secondary line.
//   <InfoRow leading={<DateTile date={d} />} title="Friday, December 4" subtitle="3-5 PM" />
export default function InfoRow({ leading, title, subtitle, center = false, className = '' }) {
  return (
    <div className={`ui-info-row ${center ? 'ui-info-row--center' : ''} ${className}`.trim()}>
      {leading}
      <div className="ui-info-row__text">
        <p className="ui-info-row__title">{title}</p>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}
