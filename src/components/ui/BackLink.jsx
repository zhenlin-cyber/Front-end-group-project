import { Link } from 'react-router-dom'
import arrow from '../../assets/ui/back-arrow.svg'

// `disabled` shows the link greyed out and not clickable (e.g. while saving).
export default function BackLink({ to = '/', children = 'Back', disabled = false }) {
  const content = (
    <>
      <img src={arrow} alt="" width="19.5" height="18" />
      <span>{children}</span>
    </>
  )
  if (disabled) {
    return (
      <span className="ui-back-link ui-back-link--disabled" aria-disabled="true">
        {content}
      </span>
    )
  }
  return (
    <Link to={to} className="ui-back-link">
      {content}
    </Link>
  )
}
