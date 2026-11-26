import { Link } from 'react-router-dom'
import arrow from '../../assets/ui/back-arrow.svg'

export default function BackLink({ to = '/', children = 'Back' }) {
  return (
    <Link to={to} className="ui-back-link">
      <img src={arrow} alt="" width="19.5" height="18" />
      <span>{children}</span>
    </Link>
  )
}
