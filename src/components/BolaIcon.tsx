interface Props { size?: number }

export function BolaIcon({ size = 48 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bolaGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d9d9d9" />
        </radialGradient>
        <clipPath id="bolaClip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>

      {/* Esfera branca */}
      <circle cx="50" cy="50" r="46" fill="url(#bolaGrad)" stroke="#1a1a1a" strokeWidth="3" />

      <g clipPath="url(#bolaClip)" fill="#1a1a1a">
        {/* Pentágono central */}
        <polygon points="50,38 62,47 57,61 43,61 38,47" />
        {/* Pentágonos das bordas (parciais) */}
        <polygon points="50,38 38,47 30,38 38,24 50,24" />
        <polygon points="50,38 62,47 70,38 62,24 50,24" />
        <polygon points="38,47 43,61 33,72 22,64 25,50" />
        <polygon points="62,47 57,61 67,72 78,64 75,50" />
        <polygon points="43,61 57,61 60,76 50,84 40,76" />
      </g>

      {/* Linhas conectando (gomos) */}
      <g clipPath="url(#bolaClip)" stroke="#1a1a1a" strokeWidth="2" fill="none" opacity="0.55">
        <line x1="50" y1="24" x2="50" y2="38" />
        <line x1="25" y1="50" x2="38" y2="47" />
        <line x1="75" y1="50" x2="62" y2="47" />
        <line x1="40" y1="76" x2="43" y2="61" />
        <line x1="60" y1="76" x2="57" y2="61" />
      </g>

      {/* Borda */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#000000" strokeWidth="2.5" />
    </svg>
  )
}
