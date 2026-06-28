interface Props {
  value: number
  onChange: (v: number) => void
  disabled: boolean
}

export function ScoreStepper({ value, onChange, disabled }: Props) {
  return (
    <div className="stepper">
      <button
        className="stepper-btn"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value === 0}
        aria-label="Diminuir"
      >−</button>
      <span className="stepper-num">{value}</span>
      <button
        className="stepper-btn"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={disabled}
        aria-label="Aumentar"
      >+</button>
    </div>
  )
}
