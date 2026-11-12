import { Redirect, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { parseIsoDate } from '@daily-prayer/core/calendar'
import { DayView } from '../../components/DayView.tsx'

/** A date: /day/2026-11-10. A date that is not valid opens today. */
export default function Day() {
  const { date } = useLocalSearchParams<{ date: string }>()
  const d = useMemo(() => parseIsoDate(date ?? ''), [date])
  if (!d) return <Redirect href="/" />
  return <DayView key={date} date={d} />
}
