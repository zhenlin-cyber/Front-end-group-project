// Temporary stand-in for pages other teammates are building.
// Replace each route's <Placeholder> in App.jsx with the real page.
export default function Placeholder({ title, owner }) {
  return (
    <div className="card">
      <h1>{title}</h1>
      <p className="muted">Coming soon — {owner} is building this page.</p>
    </div>
  )
}
