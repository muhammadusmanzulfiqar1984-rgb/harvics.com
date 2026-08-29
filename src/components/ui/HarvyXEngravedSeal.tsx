'use client'

/** Engraved gold medallion — HarvyX brand mark (not a clock). */
export function HarvyXEngravedSeal({
  size = 52,
  className = '',
  title = 'HarvyX',
}: {
  size?: number
  className?: string
  title?: string
}) {
  return (
    <div
      className={`harvics-harvyx-engraved-seal flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={title}
      aria-label={title}
    >
      <svg viewBox="0 0 100 100" className="harvics-harvyx-engraved-seal-svg w-full h-full" role="img">
        <defs>
          <radialGradient id="harvyx-seal-dial" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#1a1410" />
            <stop offset="55%" stopColor="#0a0806" />
            <stop offset="100%" stopColor="#030201" />
          </radialGradient>

          <linearGradient id="harvyx-seal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d08e" />
            <stop offset="28%" stopColor="#c8a96e" />
            <stop offset="52%" stopColor="#e8cc8a" />
            <stop offset="76%" stopColor="#9a7d45" />
            <stop offset="100%" stopColor="#c3a35e" />
          </linearGradient>

          <linearGradient id="harvyx-seal-gold-ring" x1="14%" y1="6%" x2="86%" y2="94%">
            <stop offset="0%" stopColor="#edd9a8" />
            <stop offset="38%" stopColor="#c8a96e" />
            <stop offset="72%" stopColor="#7a6235" />
            <stop offset="100%" stopColor="#d4b87a" />
          </linearGradient>

          <linearGradient id="harvyx-seal-gold-inset" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#3d2e18" stopOpacity="0.5" />
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="#f5e6c4" stopOpacity="0.1" />
          </linearGradient>

          <filter id="harvyx-seal-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.65" />
            <feDropShadow dx="0" dy="-0.5" stdDeviation="0.35" floodColor="#e8cc8a" floodOpacity="0.15" />
          </filter>

          <filter id="harvyx-seal-engrave" x="-10%" y="-10%" width="120%" height="120%">
            <feOffset in="SourceAlpha" dx="0" dy="0.7" result="offset" />
            <feGaussianBlur in="offset" stdDeviation="0.28" result="blur" />
            <feFlood floodColor="#1a1208" floodOpacity="0.9" result="shadow" />
            <feComposite in="shadow" in2="blur" operator="in" result="innerShadow" />
            <feOffset in="SourceAlpha" dx="0" dy="-0.5" result="highlightOffset" />
            <feGaussianBlur in="highlightOffset" stdDeviation="0.22" result="highlightBlur" />
            <feFlood floodColor="#f5e6c4" floodOpacity="0.38" result="highlight" />
            <feComposite in="highlight" in2="highlightBlur" operator="in" result="innerHighlight" />
            <feMerge>
              <feMergeNode in="innerShadow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="innerHighlight" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#harvyx-seal-shadow)">
          <circle cx="50" cy="50" r="48" fill="url(#harvyx-seal-dial)" />
          <circle cx="50" cy="50" r="48" fill="url(#harvyx-seal-gold-inset)" />

          {/* Outer beveled ring */}
          <circle cx="50" cy="50" r="46.5" fill="none" stroke="url(#harvyx-seal-gold-ring)" strokeWidth="2" />
          <circle cx="50" cy="50" r="43.5" fill="none" stroke="rgba(200,169,110,0.18)" strokeWidth="0.5" />

          {/* Ornamental quatrefoil — engraved crest, not clock ticks */}
          <g stroke="url(#harvyx-seal-gold)" strokeWidth="0.65" fill="none" opacity="0.55">
            <path d="M50 14 C58 22, 58 30, 50 38 C42 30, 42 22, 50 14" />
            <path d="M50 86 C58 78, 58 70, 50 62 C42 70, 42 78, 50 86" />
            <path d="M14 50 C22 42, 30 42, 38 50 C30 58, 22 58, 14 50" />
            <path d="M86 50 C78 42, 70 42, 62 50 C70 58, 78 58, 86 50" />
          </g>

          {/* Inner wreath ring */}
          <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(200,169,110,0.14)" strokeWidth="0.45" strokeDasharray="2.5 3.5" />

          {/* Monogram */}
          <text
            x="50"
            y="44"
            textAnchor="middle"
            fill="url(#harvyx-seal-gold)"
            fontSize="10"
            fontFamily="var(--font-playfair-display), Georgia, 'Times New Roman', serif"
            fontWeight="600"
            letterSpacing="0.1em"
            filter="url(#harvyx-seal-engrave)"
          >
            HARVY
          </text>
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fill="url(#harvyx-seal-gold)"
            fontSize="15"
            fontFamily="var(--font-playfair-display), Georgia, 'Times New Roman', serif"
            fontWeight="700"
            letterSpacing="0.22em"
            filter="url(#harvyx-seal-engrave)"
          >
            X
          </text>

          {/* Bottom crest line */}
          <line x1="34" y1="66" x2="66" y2="66" stroke="rgba(200,169,110,0.35)" strokeWidth="0.5" />
          <line x1="38" y1="68.5" x2="62" y2="68.5" stroke="rgba(200,169,110,0.2)" strokeWidth="0.35" />
        </g>
      </svg>
    </div>
  )
}
