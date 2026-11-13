// The settings. Each app keeps them on the device, in its own storage.

import { bibleById, DEFAULT_BIBLE, type BibleId } from './bibles.ts'

export interface Prefs {
  /** Show the proverb. */
  proverb: boolean
  /** Show the commemoration and the writing about the person. */
  commemoration: boolean
  /** The translation of the readings. */
  bible: BibleId
  /** The reader has chosen a language and a Bible on the welcome screen. */
  onboarded: boolean
}

export const DEFAULT_PREFS: Prefs = { proverb: true, commemoration: true, bible: DEFAULT_BIBLE, onboarded: false }

export const PREFS_KEY = 'daily-prayer:prefs'

export const PREF_OPTIONS: { key: 'proverb' | 'commemoration'; label: string; hint: string }[] = [
  { key: 'proverb', label: 'Proverb', hint: 'Show the proverb for the day.' },
  { key: 'commemoration', label: 'Commemorations', hint: 'Show the person that the church remembers, and the writing about that person.' },
]

/** Read stored settings. Text that is missing or not valid gives the defaults. */
export function parsePrefs(raw: string | null | undefined): Prefs {
  try {
    if (!raw) return DEFAULT_PREFS
    const prefs = { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) }
    // A translation that the app no longer has gives the default.
    if (!bibleById(prefs.bible)) prefs.bible = DEFAULT_BIBLE
    return prefs
  } catch {
    return DEFAULT_PREFS
  }
}
