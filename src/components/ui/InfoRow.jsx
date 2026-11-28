// Leading tile + bold title + optional secondary line, vertically centered.
//   <InfoRow leading={<DateTile date={d} />} title="Friday, December 4" subtitle="3-5 PM" />
export default function InfoRow({ leading, title, subtitle, className = '' }) {
  return (
    <div className={`ui-info-row ${className}`.trim()}>
      {leading}
      <div className="ui-info-row__text">
        <p className="ui-info-row__title">{title}</p>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}
