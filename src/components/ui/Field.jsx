// Label + form control + optional hint or error.
//   <Field label="Title" htmlFor="title" error={errors.title}>
//     <Input id="title" … />
//   </Field>
export default function Field({ label, htmlFor, hint, error, className = '', children }) {
  const messageId = htmlFor ? `${htmlFor}-message` : undefined
  return (
    <div className={`ui-field ${className}`.trim()}>
      <label htmlFor={htmlFor} className="ui-label">{label}</label>
      {children}
      {error ? (
        <p id={messageId} className="ui-field__message ui-field__message--error" role="alert">{error}</p>
      ) : (
        hint && <p id={messageId} className="ui-field__message">{hint}</p>
      )}
    </div>
  )
}
