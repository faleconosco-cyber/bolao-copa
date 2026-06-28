interface Props { size?: number }

export function BolaIcon({ size = 48 }: Props) {
  return (
    <img
      src="/bola-2026-redonda.png"
      alt="Bola oficial Copa 2026"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
    />
  )
}
