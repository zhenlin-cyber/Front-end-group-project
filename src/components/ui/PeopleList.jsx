import Person from './Person'
import Section from './Section'

// Labeled vertical list of people.
//   <PeopleList title="Going (3/4)" people={[{ uid, name, photoURL }]} />
export default function PeopleList({ title, people, emptyText = 'No one yet.', className = '' }) {
  return (
    <Section title={title} className={`ui-people-list ${className}`.trim()}>
      {people.length === 0 ? (
        <p className="ui-people-list__empty">{emptyText}</p>
      ) : (
        <ul className="ui-people-list__items">
          {people.map((p) => (
            <li key={p.uid}>
              <Person uid={p.uid} name={p.name} photoURL={p.photoURL} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
