import React from 'react'
import { useJarStore } from './state/useJarStore'
import JarStage from './components/JarStage'
import AddCoinModal from './components/AddCoinModal'
import { playCoinSound } from './lib/audio'

const quotes = [
  '“Insight is free. Restraint costs a coin.”',
  '“Deposit snark. Withdraw clarity.”',
  '“Hot takes belong in jars.”',
  '“Quips today, wisdom tomorrow.”',
]

export default function App() {
  const { addEntry, clearAll } = useJarStore()
  const [open, setOpen] = React.useState(false)
  const [qIdx, setQIdx] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => setQIdx((i) => (i + 1) % quotes.length), 4000)
    return () => clearInterval(id)
  }, [])

  const onSave = (coin: { name: string; desc: string; note: string }) => {
    const entry = addEntry({ coinName: coin.name, coinDesc: coin.desc, note: coin.note })
    playCoinSound()
    setOpen(false)
  }

  const reset = () => {
    if (confirm('Clear all coins and notes?')) clearAll()
  }

  return (
    <div id="main" className="mx-auto max-w-6xl p-4 md:p-8">
      <a href="#main" className="sr-only sr-only-focusable">Skip to content</a>
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        {/* Left column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src="/assets/snarky-insight-speech-bubble.png" alt="Snarky Insight" className="h-10 w-10" />
            <span className="text-sm tracking-[0.3em] text-neutral-300">SNARKY INSIGHT</span>
          </div>

          <div className="space-y-1">
            <div className="text-neutral-400">A playful place for pointed thoughts</div>
            <h1 className="text-5xl font-black tracking-tight md:text-6xl">#$%@!&nbsp;JAR</h1>
            <div className="text-neutral-400">Drop a coin with a note. Watch the jar fill up.</div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="focus-ring rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-black shadow hover:bg-brand-400"
            >ADD A COIN</button>
            <button onClick={reset} className="focus-ring text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline">Reset</button>
          </div>

          <div aria-live="polite" className="min-h-[1.5rem] text-sm text-neutral-300">
            {quotes[qIdx]}
          </div>
        </div>

        {/* Right column */}
        <JarStage className="" />
      </div>

      <AddCoinModal open={open} onClose={() => setOpen(false)} onSave={onSave} />
    </div>
  )
}
