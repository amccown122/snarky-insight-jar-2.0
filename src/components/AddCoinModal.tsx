import React from 'react'
import { createPortal } from 'react-dom'

export type CoinType = {
  name: string
  desc: string
}

const COIN_TYPES: CoinType[] = [
  { name: 'Quip', desc: 'A quick quip or witty aside' },
  { name: 'Eye-roll', desc: 'That thing you couldn’t help saying' },
  { name: 'Hot take', desc: 'Spicy thought dropped in the convo' },
  { name: 'Zinger', desc: 'One-liner with extra snap' },
  { name: 'Spill', desc: 'A little too honest insight' },
  { name: 'Mutter', desc: 'Under-the-breath commentary' },
]

type Props = {
  open: boolean
  onClose: () => void
  onSave: (coin: { name: string; desc: string; note: string }) => void
}

export const AddCoinModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const refBackdrop = React.useRef<HTMLDivElement | null>(null)
  const refDialog = React.useRef<HTMLDivElement | null>(null)
  const [coinIdx, setCoinIdx] = React.useState(0)
  const [note, setNote] = React.useState('')
  const remaining = 200 - note.length

  React.useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    // Focus first focusable
    const t = setTimeout(() => {
      const btn = refDialog.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      btn?.focus()
    }, 10)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const focusables = refDialog.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (!focusables || focusables.length === 0) return
        const list = Array.from(focusables).filter((el) => !el.hasAttribute('disabled'))
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('keydown', key)
      clearTimeout(t)
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const disabled = remaining < 0

  const save = () => {
    if (disabled) return
    const c = COIN_TYPES[coinIdx]
    onSave({ name: c.name, desc: c.desc, note })
  }

  return createPortal(
    <div
      ref={refBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-coin-title"
      onMouseDown={(e) => {
        if (e.target === refBackdrop.current) onClose()
      }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
    >
      <div ref={refDialog} className="w-full max-w-md rounded-xl bg-neutral-900 p-5 shadow-2xl ring-1 ring-white/10">
        <h2 id="add-coin-title" className="text-xl font-semibold tracking-tight">Add a coin</h2>
        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium">Coin type
            <select
              className="mt-1 w-full rounded-md bg-neutral-800 p-2 focus-ring"
              value={coinIdx}
              onChange={(e) => setCoinIdx(Number(e.target.value))}
            >
              {COIN_TYPES.map((c, i) => (
                <option value={i} key={c.name}>{c.name} — {c.desc}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">Note
            <textarea
              className="mt-1 w-full min-h-[96px] resize-vertical rounded-md bg-neutral-800 p-2 focus-ring"
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a snarky note (optional)"
            />
          </label>
          <div className={`text-xs ${remaining < 0 ? 'text-red-400' : 'text-neutral-400'}`}>{Math.max(0, remaining)} / 200</div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="focus-ring rounded-md px-4 py-2 text-neutral-300 hover:text-white">Cancel</button>
          <button
            onClick={save}
            disabled={disabled}
            className="focus-ring rounded-md bg-brand-500 px-4 py-2 font-semibold text-black hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >Save</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AddCoinModal

