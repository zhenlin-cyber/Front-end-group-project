import { Link } from 'react-router-dom'

// <Button variant="primary" onClick={...}>Going</Button>
// <Button to="/login">Sign in</Button>   ← renders a router Link
// variant: "primary" (black fill) | "secondary" (outline, default)
export default function Button({ variant = 'secondary', to, className = '', type = 'button', ...props }) {
  const classes = `ui-button ui-button--${variant} ${className}`.trim()
  if (to) return <Link to={to} className={classes} {...props} />
  return <button type={type} className={classes} {...props} />
}

export function ButtonGroup({ className = '', ...props }) {
  return <div className={`ui-button-group ${className}`.trim()} {...props} />
}
