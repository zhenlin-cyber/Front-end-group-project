import { Link } from 'react-router-dom'
import Avatar from './Avatar'

// Avatar + name. Pass `uid` to link to their profile.
export default function Person({ uid, name, photoURL, size, className = '' }) {
  const content = (
    <>
      <Avatar src={photoURL} size={size} />
      <span>{name}</span>
    </>
  )
  const classes = `ui-person ${className}`.trim()
  return uid ? (
    <Link to={`/profile/${uid}`} className={classes}>{content}</Link>
  ) : (
    <div className={classes}>{content}</div>
  )
}
