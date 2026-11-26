// Vertical column with 32px between blocks (the page rhythm).
export default function Stack({ as: Tag = 'div', className = '', ...props }) {
  return <Tag className={`ui-stack ${className}`.trim()} {...props} />
}
