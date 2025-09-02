import React from 'react'
import { motion } from 'framer-motion'
import { useJarStore } from '../state/useJarStore'
import Coin from './Coin'

// Interior bounds of the jar in percentages relative to stage
// Tuned to align with jar-inside2.png and jar-mask2.png assuming similar aspect
const JAR_INSET = {
  left: 0.24,
  right: 0.76,
  top: 0.10,
  bottom: 0.88,
}

const MIN_SIZE_PCT = 0.052 // ~5.2% of stage width
const MAX_SIZE_PCT = 0.064

type Props = {
  className?: string
}

export const JarStage: React.FC<Props> = ({ className }) => {
  const { entries, layouts, setLayoutFor, lastAddedId, setLastAdded } = useJarStore()
  const stageRef = React.useRef<HTMLDivElement | null>(null)

  // Compute and assign a layout for a new id if missing
  React.useEffect(() => {
    if (!entries.length) return
    const newest = entries[entries.length - 1]
    if (!layouts[newest.id]) {
      const sizePct = MIN_SIZE_PCT + Math.random() * (MAX_SIZE_PCT - MIN_SIZE_PCT)
      const rot = Math.round(-18 + Math.random() * 36)
      const orderedExisting = entries
        .filter((e) => layouts[e.id])
        .map((e) => layouts[e.id])
      const { xPct, yPct } = computeNextPosition(orderedExisting, sizePct)
      setLayoutFor({ id: newest.id, xPct, yPct, sizePct, rot })
    }
  }, [entries, layouts, setLayoutFor])

  const stageW = stageRef.current?.clientWidth ?? 0
  const stageH = stageRef.current?.clientHeight ?? 0

  // Render coins sorted by ts
  const coins = React.useMemo(() => {
    return [...entries]
      .sort((a, b) => a.ts - b.ts)
      .map((e) => {
        const lo = layouts[e.id]
        return { entry: e, layout: lo }
      })
  }, [entries, layouts])

  return (
    <div className={className}>
      <div
        ref={stageRef}
        className="relative aspect-[4/5] w-full overflow-visible rounded-3xl bg-gradient-to-br from-neutral-800/40 to-neutral-900/60 p-4 shadow-inner ring-1 ring-white/10"
        aria-label="Jar stage"
      >
        {/* Back layer: jar interior */}
        <img src="/assets/jar-inside2.png" alt="Jar" className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain" />

        {/* Coins masked to jar */}
        <div className="pointer-events-none absolute inset-0 jar-mask">
          {coins.map(({ entry, layout }) => {
            if (!layout || stageW === 0) return null
            const insideW = (JAR_INSET.right - JAR_INSET.left) * stageW
            const insideH = (JAR_INSET.bottom - JAR_INSET.top) * stageH
            const x = JAR_INSET.left * stageW + layout.xPct * insideW
            const yTop = JAR_INSET.top * stageH
            const yBottom = JAR_INSET.bottom * stageH
            const y = yBottom - layout.yPct * insideH
            const size = layout.sizePct * stageW
            const isNew = lastAddedId === entry.id
            return (
              <motion.div
                key={entry.id}
                className="absolute"
                style={{ left: x - size / 2, top: y - size, width: size, height: size }}
              >
                <Coin
                  id={entry.id}
                  size={size}
                  rotate={layout.rot}
                  isNew={isNew}
                  onSettled={() => {
                    if (isNew) setLastAdded(null)
                  }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Foreground: tape/art overlay */}
        <img src="/assets/tape-art2.png" alt="Decorative tape" className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain" />

        {/* Bottom-right CSV download icon */}
        <div className="pointer-events-auto absolute bottom-3 right-3">
          <CSVButton />
        </div>
      </div>
    </div>
  )
}

function computeNextPosition(existing: { xPct: number; yPct: number; sizePct: number }[], nextSizePct: number) {
  // Stack coins in rows from bottom, tracking row used width within jar bounds.
  type Row = { used: number; height: number }
  const rows: Row[] = []
  const rowGap = 0.14 // overlap between rows
  const width = 1 // interior width normalized to 1

  // Recreate rows from existing sizes in entry order
  const sizes = existing.map((e) => e.sizePct) // preserve insertion order
  for (const s of sizes) {
    let row = rows[rows.length - 1]
    const rowH = s
    if (!row || row.used + s > width) {
      row = { used: 0, height: rowH }
      rows.push(row)
    }
    row.used += s
  }

  // Place next coin
  let row = rows[rows.length - 1]
  const rowH = nextSizePct
  if (!row || row.used + nextSizePct > width) {
    row = { used: 0, height: rowH }
    rows.push(row)
  }
  const xPct = row.used + nextSizePct / 2 // center of coin
  row.used += nextSizePct
  const yPct = (rows.length - 1) * (rowH * (1 - rowGap))
  // Normalize y to 0..1 of interior height
  const yClamped = Math.min(0.98, yPct + nextSizePct / 2)
  return { xPct, yPct: yClamped }
}

const CSVButton: React.FC = () => {
  const { entries } = useJarStore()
  const onClick = React.useCallback(() => {
    import('../lib/csv').then(({ entriesToCSV, downloadCSV }) => {
      const csv = entriesToCSV(entries)
      downloadCSV('snarky-jar.csv', csv)
    })
  }, [entries])
  return (
    <button
      aria-label="Export CSV"
      title="Export CSV"
      onClick={onClick}
      className="focus-ring group inline-flex items-center justify-center rounded-full bg-neutral-900/70 p-2 text-neutral-300 ring-1 ring-white/10 hover:text-white hover:ring-white/30"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  )
}

export default JarStage
