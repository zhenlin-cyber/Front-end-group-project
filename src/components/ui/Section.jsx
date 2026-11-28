import { Label } from './Text'

// Labeled block: heading, then content 24px below.
//   <Section title="Description"><Body>…</Body></Section>
export default function Section({ title, as: Tag = 'section', className = '', children }) {
  return (
    <Tag className={`ui-section ${className}`.trim()}>
      <Label>{title}</Label>
      {children}
    </Tag>
  )
}
