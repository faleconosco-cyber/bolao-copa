interface Props { size?: number }

export function BolaIcon({ size = 48 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFE84D" />
          <stop offset="100%" stopColor="#FFDF00" />
        </radialGradient>
        <clipPath id="circle">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      {/* Bola amarela */}
      <circle cx="50" cy="50" r="46" fill="url(#grad)" stroke="#009c3b" strokeWidth="4" />
      {/* Manchas verdes */}
      <g clipPath="url(#circle)" fill="#009c3b" opacity="0.85">
        <polygon points="50,18 62,28 58,42 42,42 38,28" />
        <polygon points="18,42 30,36 40,44 36,58 22,56" />
        <polygon points="82,42 70,36 60,44 64,58 78,56" />
        <polygon points="34,74 38,60 52,60 58,74 46,82" />
        <polygon points="66,74 62,60 52,60 46,74 58,82" />
      </g>
      {/* Borda */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#007a2e" strokeWidth="4" />
    </svg>
  )
}
