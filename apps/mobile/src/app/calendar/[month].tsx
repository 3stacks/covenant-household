import { Redirect, useLocalSearchParams } from 'expo-router'
import { parseMonth } from '@daily-prayer/core/routes'
import { CalendarView } from '../../components/CalendarView.tsx'

/** A month: /calendar/2026-11. */
export default function Month() {
  const { month } = useLocalSearchParams<{ month: string }>()
  const m = parseMonth(month ?? '')
  if (!m) return <Redirect href="/calendar" />
  return <CalendarView key={month} year={m.year} month={m.month} />
}
