import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_PREFS, parsePrefs, PREFS_KEY, type Prefs } from '@daily-prayer/core/prefs'

// The settings stay on the device.

type PrefsValue = [Prefs, (change: Partial<Prefs>) => void]
const PrefsContext = createContext<PrefsValue>([DEFAULT_PREFS, () => {}])

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(
      (raw) => setPrefs(parsePrefs(raw)),
      () => {
        // Storage failed. Use the defaults.
      },
    )
  }, [])
  const update = useCallback((change: Partial<Prefs>) => {
    setPrefs((old) => {
      const next = { ...old, ...change }
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {
        // Storage failed. The setting lasts until the app closes.
      })
      return next
    })
  }, [])
  return <PrefsContext.Provider value={[prefs, update]}>{children}</PrefsContext.Provider>
}

export const usePrefs = () => useContext(PrefsContext)
