// The settings. Each app keeps them on the device, in its own storage.

export interface Prefs {
  /** Show the proverb. */
  proverb: boolean
  /** Show the commemoration and the writing about the person. */
  commemoration: boolean
}

export const DEFAULT_PREFS: Prefs = { proverb: true, commemoration: true }

export const PREFS_KEY = 'daily-prayer:prefs'

export const PREF_OPTIONS: { key: keyof Prefs; label: string; hint: string }[] = [
  { key: 'proverb', label: 'Proverb', hint: 'Show the proverb for the day.' },
  { key: 'commemoration', label: 'Commemorations', hint: 'Show the person that the church remembers, and the writing about that person.' },
]

/** Read stored settings. Text that is missing or not valid gives the defaults. */
export function parsePrefs(raw: string | null | undefined): Prefs {
  try {
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}
