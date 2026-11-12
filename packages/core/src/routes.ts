// The paths of the app. The web app puts them after "#". The mobile app uses
// them as screen paths and as deep links (dailyprayer://day/2026-11-10).
//   /                   today
//   /day/2026-11-10     a date
//   /settings           the settings
//   /about              about the app, and the sources
//   /how                how to use the app
//   /calendar/2026-11   the church year, by month

import { isoDate, parseIsoDate } from './calendar.ts'

export type Route =
  | { view: 'day'; date: Date; today: boolean }
  | { view: 'settings' }
  | { view: 'about' }
  | { view: 'how' }
  | { view: 'calendar'; year: number; month: number }

export function parseRoute(path: string, now = new Date()): Route {
  const parts = path.replace(/^#?\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'settings') return { view: 'settings' }
  if (parts[0] === 'about') return { view: 'about' }
  if (parts[0] === 'how') return { view: 'how' }
  if (parts[0] === 'calendar') {
    const m = parseMonth(parts[1] ?? '')
    return m ? { view: 'calendar', ...m } : { view: 'calendar', year: now.getFullYear(), month: now.getMonth() }
  }
  if (parts[0] === 'day') {
    const date = parseIsoDate(parts[1] ?? '')
    if (date) return { view: 'day', date, today: isoDate(date) === isoDate(now) }
  }
  return { view: 'day', date: now, today: true }
}

/** "2026-11" → { year: 2026, month: 10 }. The month counts from 0. */
export function parseMonth(s: string): { year: number; month: number } | undefined {
  const m = s.match(/^(\d{4})-(\d{2})$/)
  return m && +m[2] >= 1 && +m[2] <= 12 ? { year: +m[1], month: +m[2] - 1 } : undefined
}

export const dayPath = (d: Date) => `/day/${isoDate(d)}`

/** The calendar page for the month of a date. */
export const calendarPath = (d: Date) => `/calendar/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
