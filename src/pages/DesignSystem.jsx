import { useState } from 'react'
// Living reference for the components in src/components/ui. Visit /design.
import {
  BackLink, Body, Button, ButtonGroup, Card, ChoiceChips, DateTile, Field, InfoRow, Input, Textarea,
  Label, MediaFrame, PeopleList, Person, Section, Stack, Tile, Title,
} from '../components/ui'

const sample = [
  { uid: 'a', name: 'Sam Rivera' },
  { uid: 'b', name: 'Jordan Lee' },
]

function Demo({ name, children }) {
  return (
    <section className="ds-section">
      <code>{name}</code>
      <div>{children}</div>
    </section>
  )
}

export default function DesignSystem() {
  const [chip, setChip] = useState('sports')
  return (
    <div className="ds">
      <Title>Design system</Title>
      <Body>Components from <code>src/components/ui</code>. Tokens live in <code>src/styles/tokens.css</code>.</Body>

      <Demo name="<Title> <Label> <Body>">
        <Title>Pick up basketball</Title>
        <Label>Section label</Label>
        <Body>Body copy uses a 1.5 line height for longer descriptions.</Body>
      </Demo>

      <Demo name="<Button> <ButtonGroup>">
        <ButtonGroup>
          <Button variant="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button to="/">As link</Button>
        </ButtonGroup>
        <ButtonGroup fill style={{ width: 400 }}>
          <Button variant="primary">fill</Button>
          <Button>fill</Button>
        </ButtonGroup>
      </Demo>

      <Demo name="<Card>">
        <Card>
          <Label>RSVP</Label>
          <Body>Cards use the off-white surface with a grey outline.</Body>
        </Card>
      </Demo>

      <Demo name="<Avatar> <Person>">
        <Person name="No link (no uid)" />
      </Demo>

      <Demo name="<Tile> <DateTile> <InfoRow>">
        <InfoRow leading={<DateTile date={new Date(2026, 11, 4)} />} title="Friday, December 4" subtitle="3-5 PM" />
        <InfoRow leading={<Tile size={36} />} title="Berkeley Bowl Marketplace" subtitle="1234 Market St" />
      </Demo>

      <Demo name="<Section> <Stack>">
        <Stack>
          <Section title="Description"><Body>Section puts 24px between its label and content.</Body></Section>
          <Section title="Host(s)"><Person name="Stack puts 32px between blocks" /></Section>
        </Stack>
      </Demo>

      <Demo name="<PeopleList>">
        <ButtonGroup style={{ gap: 32 }}>
          <PeopleList title="Going (2/4)" people={sample} />
          <PeopleList title="Interested (0)" people={[]} />
        </ButtonGroup>
      </Demo>

      <Demo name="<Field> <Input> <Textarea>">
        <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Event name" htmlFor="ds-title" hint="Hints sit 8px under the field.">
            <Input id="ds-title" placeholder="Pick up basketball" />
          </Field>
          <Field label="With an error" htmlFor="ds-err" error="Give your event a name.">
            <Input id="ds-err" invalid />
          </Field>
          <div className="ui-field-row">
            <Field label="Starts" htmlFor="ds-start"><Input id="ds-start" type="time" /></Field>
            <Field label="Ends" htmlFor="ds-end"><Input id="ds-end" type="time" /></Field>
          </div>
          <Field label="Description" htmlFor="ds-desc"><Textarea id="ds-desc" /></Field>
        </div>
      </Demo>

      <Demo name="<ChoiceChips>">
        <ChoiceChips
          label="Activity"
          value={chip}
          onChange={setChip}
          options={[
            { value: 'sports', label: 'Sports' },
            { value: 'experiences', label: 'Experiences' },
            { value: 'nature', label: 'Nature' },
            { value: 'arts', label: 'Arts' },
          ]}
        />
      </Demo>

      <Demo name="<MediaFrame>">
        <MediaFrame style={{ width: 240, height: 160 }}><span className="muted">Map or image</span></MediaFrame>
      </Demo>

      <Demo name="<BackLink>">
        <BackLink to="/">Back to event map</BackLink>
      </Demo>
    </div>
  )
}
