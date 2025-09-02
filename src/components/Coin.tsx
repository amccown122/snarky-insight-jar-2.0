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
  const hue = 42 + Math.random() * 8 // 42..50
  const sat = 90 + Math.random() * 5
  const light = (l: number) => `hsl(${hue} ${sat}% ${l}%)`
  return {
    rimDark: light(30),
    rimLight: light(65),
    faceLight: light(58),
    faceMid: light(47),
    faceDark: light(36),
    gleam: 'rgba(255,255,255,0.8)',
  }
}

export const Coin: React.FC<Props> = ({ id, size, rotate, isNew, onSettled }) => {
  const reduce = useReducedMotion()
  const stops = React.useMemo(() => getStops(), [])

  const r = size / 2
  const reeded = Array.from({ length: 36 })
  const reedW = Math.max(1, Math.round(size * 0.03))
  const reedH = Math.max(2, Math.round(size * 0.12))

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
          <radialGradient id={`g-face-${id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={stops.faceLight} />
            <stop offset="45%" stopColor={stops.faceMid} />
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
        </defs>
        {/* Rim */}
        <circle cx={r} cy={r} r={r - 0.5} fill={`url(#g-face-${id})`} stroke={`url(#g-rim-${id})`} strokeWidth={Math.max(2, size * 0.06)} />
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
                fill="rgba(255,255,255,0.28)"
                transform={`translate(${rx} ${ry}) rotate(${aDeg + 90})`}
                rx={reedW / 2}
              />
            )
          })}
        </g>
        {/* Inner bevel ring */}
        <circle cx={r} cy={r} r={r * 0.78} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={Math.max(1, size * 0.02)} />
        <circle cx={r} cy={r} r={r * 0.82} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={Math.max(1, size * 0.02)} />
        {/* Soft highlight swoosh */}
        <ellipse cx={r * 0.6} cy={r * 0.55} rx={r * 0.55} ry={r * 0.28} fill={`url(#g-gleam-${id})`} transform={`rotate(-25 ${r * 0.6} ${r * 0.55})`} />
      </svg>
    </motion.div>
  )
}

export default Coin

