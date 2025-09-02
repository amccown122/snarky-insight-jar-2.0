import type { JarEntry } from '../state/useJarStore'

function csvEscape(value: string) {
  const needs = /[",\n]/.test(value)
  const v = value.replace(/"/g, '""')
  return needs ? `"${v}"` : v
}

export function entriesToCSV(entries: JarEntry[]): string {
  const header = ['id', 'ts', 'coinName', 'coinDesc', 'note']
  const rows = entries.map((e) => [e.id, String(e.ts), e.coinName, e.coinDesc, e.note])
  const lines = [header, ...rows]
    .map((cols) => cols.map((c) => csvEscape(c)).join(','))
    .join('\n')
  return lines + '\n'
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

