// Bordered, off-white surface. Use `as="section"` etc. for semantics.
export default function Card({ as: Tag = 'div', className = '', ...props }) {
  return <Tag className={`ui-card ${className}`.trim()} {...props} />
}
