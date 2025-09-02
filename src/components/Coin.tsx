import { motion, useReducedMotion } from 'framer-motion'
import React from 'react'

export type CoinVisual = {
  id: string
  sizePx: number
  rotation: number
  highlighted?: boolean
}

type Props = {
  id: string
  size: number // pixels
  rotate: number
  isNew?: boolean
  onSettled?: () => void
}

// Warm gold hues with subtle variation
function getStops() {
  // Stronger, more legible warm-gold palette with subtle randomization
  const variant = Math.random() * 0.08 - 0.04 // -0.04..0.04
  const adj = (hex: string) => hex
  return {
    rimDark: '#8c5a1b',
    rimLight: '#f2d07a',
    faceLight: '#ffe29a',
    faceMid: '#f3bf4f',
    faceDark: '#c98a2d',
    gleam: 'rgba(255,255,255,0.9)',
  }
}

export const Coin: React.FC<Props> = ({ id, size, rotate, isNew, onSettled }) => {
  const reduce = useReducedMotion()
  const stops = React.useMemo(() => getStops(), [])

  const r = size / 2
  const reeded = Array.from({ length: 42 })
  const reedW = Math.max(1, Math.round(size * 0.028))
  const reedH = Math.max(2, Math.round(size * 0.16))

  const animate = reduce
    ? { y: 0, rotate, scaleY: 1 }
    : {
        y: [ -size * 1.5, 0, -r * 0.15, 0 ],
        rotate: [0, rotate],
        scaleY: [1, 1, 0.86, 1],
      }

  const transition = reduce
    ? { duration: 0 }
    : {
        duration: 1.15,
        times: [0, 0.72, 0.86, 1],
        ease: ['easeOut', 'easeOut', 'easeInOut', 'easeOut'],
      }

  return (
    <motion.div
      role="img"
      aria-label="coin"
      initial={isNew ? { y: -size * 1.5, rotate: 0, scaleY: 1 } : false}
      animate={animate}
      transition={transition}
      onAnimationComplete={onSettled}
      style={{ width: size, height: size, transformOrigin: '50% 100%' }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id={`g-face-${id}`} cx="35%" cy="30%" r="70%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor={stops.faceLight} />
            <stop offset="42%" stopColor={stops.faceMid} />
            <stop offset="100%" stopColor={stops.faceDark} />
          </radialGradient>
          <linearGradient id={`g-rim-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stops.rimLight} />
            <stop offset="100%" stopColor={stops.rimDark} />
          </linearGradient>
          <linearGradient id={`g-gleam-${id}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={stops.gleam} stopOpacity="0.85" />
            <stop offset="100%" stopColor={stops.gleam} stopOpacity="0" />
          </linearGradient>
          <filter id={`f-soft-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="rgba(0,0,0,0.35)"/>
          </filter>
        </defs>
        {/* Rim + face */}
        <g filter={`url(#f-soft-${id})`}>
          <circle cx={r} cy={r} r={r - 0.5} fill={`url(#g-face-${id})`} stroke={`url(#g-rim-${id})`} strokeWidth={Math.max(2, size * 0.08)} />
        </g>
        {/* Reeded edge hint: small ticks around circumference */}
        <g transform={`translate(${r} ${r}) rotate(${rotate})`}>
          {reeded.map((_, i) => {
            const angle = (i / reeded.length) * Math.PI * 2
            const rx = Math.cos(angle) * (r - reedW)
            const ry = Math.sin(angle) * (r - reedW)
            const aDeg = (angle * 180) / Math.PI
            return (
              <rect
                key={i}
                x={-reedW / 2}
                y={-r + reedW}
                width={reedW}
                height={reedH}
                fill="rgba(255,255,255,0.36)"
                transform={`translate(${rx} ${ry}) rotate(${aDeg + 90})`}
                rx={reedW / 2}
              />
            )
          })}
        </g>
        {/* Inner bevel ring */}
        <circle cx={r} cy={r} r={r * 0.78} fill="none" stroke="rgba(0,0,0,0.32)" strokeWidth={Math.max(1, size * 0.02)} />
        <circle cx={r} cy={r} r={r * 0.82} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={Math.max(1, size * 0.02)} />
        {/* Soft highlight swoosh */}
        <ellipse cx={r * 0.58} cy={r * 0.52} rx={r * 0.56} ry={r * 0.30} fill={`url(#g-gleam-${id})`} transform={`rotate(-25 ${r * 0.58} ${r * 0.52})`} />
      </svg>
    </motion.div>
  )
}

export default Coin
