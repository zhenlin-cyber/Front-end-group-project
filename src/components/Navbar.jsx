import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Link Up</Link>
      <div className="nav-links">
        <NavLink to="/">Board</NavLink>
        {user && <NavLink to="/events/new">Post event</NavLink>}
        {user && <NavLink to="/my-events">My events</NavLink>}
      </div>
      <div className="nav-user">
        {user ? (
          <>
            <Link to={`/profile/${user.uid}`} className="nav-profile">
              {user.photoURL && <img src={user.photoURL} alt="" className="avatar small" referrerPolicy="no-referrer" />}
              <span>{user.displayName}</span>
            </Link>
            <button className="btn" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <NavLink to="/login" className="btn primary">Sign in</NavLink>
        )}
      </div>
    </nav>
  )
}
