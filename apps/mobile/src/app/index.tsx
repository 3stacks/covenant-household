import { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { isoDate } from '@daily-prayer/core/calendar'
import { DayView } from '../components/DayView.tsx'

/** Today. The page changes to the new day when the app opens again after midnight. */
export default function Today() {
  const [date, setDate] = useState(() => new Date())
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setDate((old) => (isoDate(old) === isoDate(new Date()) ? old : new Date()))
    })
    return () => sub.remove()
  }, [])
  return <DayView key={isoDate(date)} date={date} />
}
