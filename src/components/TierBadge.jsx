// Small pill showing an attendance tier: New, Regular or Local Fixture.
// Styled with the design tokens; see .tier rules in src/index.css.
export default function TierBadge({ tier }) {
  const slug = tier.toLowerCase().replace(/\s+/g, '-')
  return <span className={`tier tier-${slug}`}>{tier}</span>
}
