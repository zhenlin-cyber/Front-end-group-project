// Square grey tile for icons. Pass children (an icon) or leave empty as a placeholder.
export function Tile({ size = 36, className = '', style, ...props }) {
  return (
    <div
      className={`ui-tile ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  )
}

// Calendar-style tile showing a date's month and day.
export function DateTile({ date, size = 48 }) {
  return (
    <Tile size={size} className="ui-date-tile" aria-hidden="true">
      <span>{date.toLocaleDateString(undefined, { month: 'short' })}</span>
      <strong>{date.getDate()}</strong>
    </Tile>
  )
}
