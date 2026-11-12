import { CalendarView } from '../../components/CalendarView.tsx'

/** The calendar of this month. */
export default function ThisMonth() {
  const now = new Date()
  return <CalendarView year={now.getFullYear()} month={now.getMonth()} />
}
