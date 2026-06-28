interface Props {
  value: number
  onChange: (v: number) => void
  disabled: boolean
}

export function ScoreStepper({ value, onChange, disabled }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value === 0}
        style={{ width: 32, height: 32, fontSize: 18, cursor: 'pointer' }}
      >−</button>
      <span style={{ minWidth: 24, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>{value}</span>
      <button
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={disabled}
        style={{ width: 32, height: 32, fontSize: 18, cursor: 'pointer' }}
      >+</button>
    </div>
  )
}
