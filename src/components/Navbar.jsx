import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { Button, Person } from './ui'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Link Up</Link>
      <div className="nav-links">
        <NavLink to="/" end>Board</NavLink>
        {user && <NavLink to="/events/new">Post event</NavLink>}
        {user && <NavLink to="/my-events">My events</NavLink>}
      </div>
      <div className="nav-user">
        {user ? (
          <>
            <Person
              uid={user.uid}
              name={user.displayName}
              photoURL={user.photoURL}
              size={28}
              className="nav-profile"
            />
            <Button onClick={signOut}>Sign out</Button>
          </>
        ) : (
          <Button to="/login" variant="primary">Sign in</Button>
        )}
      </div>
    </nav>
  )
}
