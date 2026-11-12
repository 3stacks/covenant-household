import { createCalendar } from '@daily-prayer/core/calendar'

// The web app fetches each file of the built calendar. The service worker keeps
// a copy of each file that the reader opens.
export const calendar = createCalendar(async (path) => {
  const r = await fetch(`calendar/${path}`)
  if (!r.ok) throw new Error(`calendar/${path}: ${r.status}`)
  return r.json()
})
