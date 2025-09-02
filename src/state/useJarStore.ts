import { create } from 'zustand'

export type JarEntry = {
  id: string
  ts: number
  coinName: string
  coinDesc: string
  note: string
}

export type CoinLayout = {
  id: string
  xPct: number // 0..1 inside jar interior
  yPct: number // 0..1 from bottom (0) to top (1) inside interior
  sizePct: number // relative to stage width
  rot: number
}

type JarState = {
  entries: JarEntry[]
  layouts: Record<string, CoinLayout>
  lastAddedId: string | null
  addEntry: (e: Omit<JarEntry, 'id' | 'ts'>) => JarEntry
  setLayoutFor: (layout: CoinLayout) => void
  clearAll: () => void
  setLastAdded: (id: string | null) => void
}

const ENTRIES_KEY = 'snarkyJar.v1'
const LAYOUTS_KEY = 'snarkyJar.v1_layout'

function loadEntries(): JarEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveEntries(entries: JarEntry[]) {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  } catch {}
}

function loadLayouts(): Record<string, CoinLayout> {
  try {
    const raw = localStorage.getItem(LAYOUTS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveLayouts(layouts: Record<string, CoinLayout>) {
  try {
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts))
  } catch {}
}

export const useJarStore = create<JarState>((set, get) => ({
  entries: loadEntries(),
  layouts: loadLayouts(),
  lastAddedId: null,
  addEntry: ({ coinName, coinDesc, note }) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const entry: JarEntry = { id, ts: Date.now(), coinName, coinDesc, note }
    const next = [...get().entries, entry]
    set({ entries: next, lastAddedId: id })
    saveEntries(next)
    return entry
  },
  setLayoutFor: (layout) => {
    const layouts = { ...get().layouts, [layout.id]: layout }
    set({ layouts })
    saveLayouts(layouts)
  },
  clearAll: () => {
    set({ entries: [], layouts: {}, lastAddedId: null })
    saveEntries([])
    saveLayouts({})
  },
  setLastAdded: (id) => set({ lastAddedId: id }),
}))

