import { createCalendar } from '@daily-prayer/core/calendar'
import { files } from '../../calendar/files.ts'

// The calendar is in the bundle, so the app works with no connection.
// scripts/build-calendar.ts writes calendar/ and calendar/files.ts.
export const calendar = createCalendar(async (path) => {
  const file = files[path]
  if (!file) throw new Error(`The calendar has no file ${path}`)
  return file()
})
