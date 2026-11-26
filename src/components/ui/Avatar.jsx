import placeholder from '../../assets/ui/profile-placeholder.svg'

// Round profile photo; falls back to the grey placeholder circle.
export default function Avatar({ src, size = 34, alt = '', className = '' }) {
  return (
    <img
      src={src || placeholder}
      alt={alt}
      width={size}
      height={size}
      className={`ui-avatar ${className}`.trim()}
      referrerPolicy="no-referrer"
    />
  )
}
