import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUserStats, TIERS } from '../lib/badges'
import { getUserProfile } from '../lib/users'

export default function Profile() {
  const { uid } = useParams()
  // `result.uid` records which profile was loaded, so switching between
  // profiles shows "Loading" without resetting state inside the effect.
  const [result, setResult] = useState({ uid: null, status: 'loading' })

  useEffect(() => {
    let cancelled = false
    Promise.all([getUserProfile(uid), getUserStats(uid)])
      .then(([profile, stats]) => {
        if (cancelled) return
        setResult(profile ? { uid, status: 'ready', profile, stats } : { uid, status: 'not-found' })
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setResult({ uid, status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [uid])

  const status = result.uid === uid ? result.status : 'loading' // loading | ready | not-found | error
  const { profile, stats } = result

  if (status === 'loading') return <p className="center muted">Loading profile…</p>
  if (status === 'not-found') return <p className="center">This user doesn't exist.</p>
  if (status === 'error') return <p className="center error">Couldn't load this profile.</p>

  const joined = profile.joinedAt?.toDate?.().toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
  const nextTier = [...TIERS].reverse().find((t) => t.min > stats.attended)

  return (
    <div className="card profile">
      {profile.photoURL && (
        <img src={profile.photoURL} alt="" className="avatar large" referrerPolicy="no-referrer" />
      )}
      <h1>{profile.displayName}</h1>
      {joined && <p className="muted">Joined {joined}</p>}

      <span className={`tier tier-${stats.tier.toLowerCase().replace(/\s+/g, '-')}`}>{stats.tier}</span>

      <div className="stats">
        <div className="stat">
          <strong>{stats.attended}</strong>
          <span>events attended</span>
        </div>
        <div className="stat">
          <strong>{stats.hosted}</strong>
          <span>events hosted</span>
        </div>
      </div>

      {nextTier && (
        <p className="muted">
          {nextTier.min - stats.attended} more to reach <strong>{nextTier.label}</strong>
        </p>
      )}
    </div>
  )
}
