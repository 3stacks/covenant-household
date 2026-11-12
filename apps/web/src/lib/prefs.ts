import { useCallback, useState } from 'react'
import { parsePrefs, PREFS_KEY, type Prefs } from '@daily-prayer/core/prefs'

// Settings stay on the device. Storage can be blocked, so each read and write
// has a fallback.

function read(): Prefs {
  try {
    return parsePrefs(localStorage.getItem(PREFS_KEY))
  } catch {
    return parsePrefs(null)
  }
}

export function usePrefs(): [Prefs, (change: Partial<Prefs>) => void] {
  const [prefs, setPrefs] = useState(read)
  const update = useCallback((change: Partial<Prefs>) => {
    setPrefs((old) => {
      const next = { ...old, ...change }
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      } catch {
        // Storage is blocked. The setting lasts until the page closes.
      }
      return next
    })
  }, [])
  return [prefs, update]
}
