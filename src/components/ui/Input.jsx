// Text-like inputs styled to match buttons (8px radius, 8/16 padding).
// Pass `invalid` to show the error border; it also sets aria-invalid.
export function Input({ invalid = false, className = '', ...props }) {
  return <input className={`ui-input ${className}`.trim()} aria-invalid={invalid || undefined} {...props} />
}

export function Textarea({ invalid = false, className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`ui-input ui-textarea ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}
