import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserStats } from '../lib/badges'
import { getUserProfile } from '../lib/users'
import { Avatar } from './ui'
import TierBadge from './TierBadge'

// A person (avatar + name) with their attendance tier, linking to their profile.
// Same look as the design system's <Person>, plus the tier pill.
//   <UserBadge uid={rsvp.userId} />
// Pass `name` and `photoURL` if you already have them (e.g. from an RSVP doc)
// to skip a profile lookup.
export default function UserBadge({ uid, name, photoURL }) {
  const [profile, setProfile] = useState({ name: name || '', photoURL: photoURL || null })
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    getUserStats(uid)
      .then((s) => !cancelled && setStats(s))
      .catch((err) => console.error('Badge stats failed:', err))
    if (!name) {
      getUserProfile(uid)
        .then((p) => !cancelled && setProfile({ name: p?.displayName || 'Unknown user', photoURL: p?.photoURL || null }))
        .catch((err) => console.error('Profile lookup failed:', err))
    }
    return () => {
      cancelled = true
    }
  }, [uid, name])

  return (
    <Link to={`/profile/${uid}`} className="ui-person user-badge">
      <Avatar src={photoURL || profile.photoURL} />
      <span>{name || profile.name || '…'}</span>
      {stats && <TierBadge tier={stats.tier} />}
    </Link>
  )
}
