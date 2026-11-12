import type { ReadingDay } from '@/lib/readings'

const dateFormat = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** "2026-11-29" → "Sunday 29 November 2026" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}

/** The days, in groups of one week. A group starts at each Sunday. */
export function weeks(days: ReadingDay[]): ReadingDay[][] {
  const out: ReadingDay[][] = []
  for (const day of days) {
    if (day.isSunday || out.length === 0) out.push([])
    out[out.length - 1].push(day)
  }
  return out
}
