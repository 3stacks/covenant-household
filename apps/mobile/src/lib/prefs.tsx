import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_PREFS, parsePrefs, PREFS_KEY, type Prefs } from '@daily-prayer/core/prefs'

// The settings stay on the device.

type PrefsValue = [Prefs, (change: Partial<Prefs>) => void]
const LoadedContext = createContext(false)
const PrefsContext = createContext<PrefsValue>([DEFAULT_PREFS, () => {}])

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(
      (raw) => {
        setPrefs(parsePrefs(raw))
        setLoaded(true)
      },
      () => {
        // Storage failed. Use the defaults.
        setLoaded(true)
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
  return (
    <LoadedContext.Provider value={loaded}>
      <PrefsContext.Provider value={[prefs, update]}>{children}</PrefsContext.Provider>
    </LoadedContext.Provider>
  )
}

export const usePrefs = () => useContext(PrefsContext)

/** False until the stored settings are read. */
export const usePrefsLoaded = () => useContext(LoadedContext)
