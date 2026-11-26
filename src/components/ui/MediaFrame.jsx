// Rounded, bordered frame for a map iframe or image. Set size with className/style.
export default function MediaFrame({ className = '', ...props }) {
  return <div className={`ui-media ${className}`.trim()} {...props} />
}
