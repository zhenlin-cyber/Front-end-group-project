import Person from './Person'
import { Label } from './Text'

// Labeled vertical list of people.
//   <PeopleList title="Locked in (3/4)" people={[{ uid, name, photoURL }]} />
export default function PeopleList({ title, people, emptyText = 'No one yet.', className = '' }) {
  return (
    <section className={`ui-people-list ${className}`.trim()}>
      <Label>{title}</Label>
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
    </section>
  )
}
