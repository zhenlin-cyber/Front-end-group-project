import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserStats } from '../lib/badges'
import { getUserProfile } from '../lib/users'

// Shows a user's name with their attendance tier, linking to their profile.
//   <UserBadge uid={rsvp.userId} />
// Pass `name` too if you already have it, to skip a profile lookup.
export default function UserBadge({ uid, name }) {
  const [displayName, setDisplayName] = useState(name || '')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    getUserStats(uid)
      .then((s) => !cancelled && setStats(s))
      .catch((err) => console.error('Badge stats failed:', err))
    if (!name) {
      getUserProfile(uid)
        .then((p) => !cancelled && setDisplayName(p?.displayName || 'Unknown user'))
        .catch((err) => console.error('Profile lookup failed:', err))
    }
    return () => {
      cancelled = true
    }
  }, [uid, name])

  return (
    <Link to={`/profile/${uid}`} className="user-badge">
      <span>{displayName || '…'}</span>
      {stats && (
        <span className={`tier tier-${stats.tier.toLowerCase().replace(/\s+/g, '-')}`}>
          {stats.tier}
        </span>
      )}
    </Link>
  )
}
