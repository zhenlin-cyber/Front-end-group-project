import Button from './Button'

// Pick one option from a row of buttons; the selected one is filled black.
//   <ChoiceChips label="Activity" options={[{ value: 'sports', label: 'Sports' }]} value={v} onChange={setV} />
export default function ChoiceChips({ label, options, value, onChange, error, className = '' }) {
  return (
    <fieldset className={`ui-fieldset ${className}`.trim()}>
      <legend className="ui-label">{label}</legend>
      <div className="ui-button-group">
        {options.map((o) => (
          <Button
            key={o.value}
            variant={o.value === value ? 'primary' : 'secondary'}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </div>
      {error && <p className="ui-field__message ui-field__message--error" role="alert">{error}</p>}
    </fieldset>
  )
}
