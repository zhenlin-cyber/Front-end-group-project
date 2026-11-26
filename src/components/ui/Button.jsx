import { Link } from 'react-router-dom'

// <Button variant="primary" onClick={...}>Going</Button>
// <Button to="/login">Sign in</Button>   ← renders a router Link
// variant: "primary" (black fill) | "secondary" (black outline, default)
export default function Button({ variant = 'secondary', to, className = '', type = 'button', ...props }) {
  const classes = `ui-button ui-button--${variant} ${className}`.trim()
  if (to) return <Link to={to} className={classes} {...props} />
  return <button type={type} className={classes} {...props} />
}

// Row of buttons, 16px apart. `fill` makes them share the row's width.
export function ButtonGroup({ fill = false, className = '', ...props }) {
  return (
    <div className={`ui-button-group ${fill ? 'ui-button-group--fill' : ''} ${className}`.trim()} {...props} />
  )
}
