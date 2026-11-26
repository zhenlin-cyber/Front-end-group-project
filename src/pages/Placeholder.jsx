import { Body, Card, Title } from '../components/ui'

// Temporary stand-in for pages other teammates are building.
// Replace each route's <Placeholder> in App.jsx with the real page.
export default function Placeholder({ title, owner }) {
  return (
    <Card as="section" className="page-card">
      <Title>{title}</Title>
      <Body className="muted">Coming soon — {owner} is building this page.</Body>
    </Card>
  )
}
