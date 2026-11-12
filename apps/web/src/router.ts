import { useEffect, useState } from 'react'
import { calendarPath, dayPath, parseRoute, type Route } from '@daily-prayer/core/routes'

// Hash routes, so the app works from any static host and offline. The paths
// are in packages/core/src/routes.ts.

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  useEffect(() => {
    const on = () => setRoute(parseRoute(location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const dayHref = (d: Date) => `#${dayPath(d)}`
export const calendarHref = (d: Date) => `#${calendarPath(d)}`
