// Page title (32px bold) — one per page.
export function Title({ as: Tag = 'h1', className = '', ...props }) {
  return <Tag className={`ui-title ${className}`.trim()} {...props} />
}

// Small semibold section heading, e.g. "RSVP", "Description", "Host(s)".
export function Label({ as: Tag = 'h2', className = '', ...props }) {
  return <Tag className={`ui-label ${className}`.trim()} {...props} />
}

// Body copy with relaxed line height.
export function Body({ as: Tag = 'p', className = '', ...props }) {
  return <Tag className={`ui-body ${className}`.trim()} {...props} />
}
