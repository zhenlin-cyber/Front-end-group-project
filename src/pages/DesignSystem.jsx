// Living reference for the components in src/components/ui. Visit /design.
import {
  BackLink, Body, Button, ButtonGroup, Card, DateTile, InfoRow,
  Label, MediaFrame, PeopleList, Person, Tile, Title,
} from '../components/ui'

const sample = [
  { uid: 'a', name: 'Sam Rivera' },
  { uid: 'b', name: 'Jordan Lee' },
]

function Section({ name, children }) {
  return (
    <section className="ds-section">
      <code>{name}</code>
      <div>{children}</div>
    </section>
  )
}

export default function DesignSystem() {
  return (
    <div className="ds">
      <Title>Design system</Title>
      <Body>Components from <code>src/components/ui</code>. Tokens live in <code>src/styles/tokens.css</code>.</Body>

      <Section name="<Title> <Label> <Body>">
        <Title>Pick up basketball</Title>
        <Label>Section label</Label>
        <Body>Body copy uses a 1.5 line height for longer descriptions.</Body>
      </Section>

      <Section name="<Button> <ButtonGroup>">
        <ButtonGroup>
          <Button variant="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button to="/">As link</Button>
        </ButtonGroup>
      </Section>

      <Section name="<Card>">
        <Card>
          <Label>RSVP</Label>
          <Body>Cards use the off-white surface with a grey outline.</Body>
        </Card>
      </Section>

      <Section name="<Avatar> <Person>">
        <Person name="No link (no uid)" />
      </Section>

      <Section name="<Tile> <DateTile> <InfoRow>">
        <InfoRow leading={<DateTile date={new Date(2026, 11, 4)} />} title="Friday, December 4" subtitle="3-5 PM" />
        <InfoRow center leading={<Tile size={36} />} title="Berkeley Bowl Marketplace" subtitle="1234 Market St" />
      </Section>

      <Section name="<PeopleList>">
        <ButtonGroup>
          <PeopleList title="Locked in (2/4)" people={sample} />
          <PeopleList title="Interested (0)" people={[]} />
        </ButtonGroup>
      </Section>

      <Section name="<MediaFrame>">
        <MediaFrame style={{ width: 240, height: 160 }}><span className="muted">Map or image</span></MediaFrame>
      </Section>

      <Section name="<BackLink>">
        <BackLink to="/">Back to event map</BackLink>
      </Section>
    </div>
  )
}
