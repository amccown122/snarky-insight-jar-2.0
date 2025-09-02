import React from 'react'
import { motion } from 'framer-motion'
import { useJarStore } from '../state/useJarStore'
import Coin from './Coin'

// Interior bounds of the jar in percentages relative to stage.
// Initial fit; we will fine-tune after live check.
const JAR_INSET = {
  left: 0.265,   // narrowed ~5% from left
  right: 0.735,  // narrowed ~5% from right
  top: 0.215,    // moved down ~5%
  bottom: 0.815, // pulled up ~10%
}

const MIN_SIZE_PCT = 0.052 // ~5.2% of stage width
const MAX_SIZE_PCT = 0.060

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
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,rgba(28,29,31,0.92),rgba(13,14,16,0.94))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
        aria-label="Jar stage"
      >
        {/* Back layer: jar interior */}
        <img src="/assets/jar-inside2.png" alt="Jar" className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain" />

        {/* Coins masked to jar */}
        <div className="pointer-events-none absolute inset-0 jar-mask overflow-hidden">
          {coins.map(({ entry, layout }) => {
            if (!layout || stageW === 0) return null
            const insideW = (JAR_INSET.right - JAR_INSET.left) * stageW
            const insideH = (JAR_INSET.bottom - JAR_INSET.top) * stageH
            // Clamp layout to interior in case of window resizes
            const margin = 0.02
            const clampedXPct = clamp(layout.xPct, 0 + layout.sizePct / 2 + margin, 1 - layout.sizePct / 2 - margin)
            const clampedYPct = clamp(layout.yPct, 0 + layout.sizePct / 2 + margin, 1 - layout.sizePct / 2 - margin)
            const x = JAR_INSET.left * stageW + clampedXPct * insideW
            const yTop = JAR_INSET.top * stageH
            const yBottom = JAR_INSET.bottom * stageH
            const y = yBottom - clampedYPct * insideH
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

        {/* Optional mask debug (DEV only) */}
        {import.meta.env.DEV && maskDebugEnabled() && (
          <MaskDebugOverlay stageW={stageW} stageH={stageH} />
        )}

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
  let xPct = row.used + nextSizePct / 2 // center of coin
  row.used += nextSizePct
  let yPct = (rows.length - 1) * (rowH * (1 - rowGap))
  // Normalize y to 0..1 of interior height
  xPct = clamp(xPct, 0 + nextSizePct / 2, 1 - nextSizePct / 2)
  yPct = clamp(yPct + nextSizePct / 2, 0 + nextSizePct / 2, 1 - nextSizePct / 2)
  return { xPct, yPct }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function maskDebugEnabled() {
  try {
    const sp = new URLSearchParams(window.location.search)
    return sp.get('maskDebug') === '1'
  } catch {
    return false
  }
}

const MaskDebugOverlay: React.FC<{ stageW: number; stageH: number }> = ({ stageW, stageH }) => {
  const left = JAR_INSET.left * stageW
  const right = JAR_INSET.right * stageW
  const top = JAR_INSET.top * stageH
  const bottom = JAR_INSET.bottom * stageH
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute border-2 border-emerald-400/60"
        style={{ left, top, width: right - left, height: bottom - top }}
      />
      <div className="absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-xs text-emerald-300">
        maskDebug: interior bounds
      </div>
    </div>
  )
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
