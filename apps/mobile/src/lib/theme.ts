import { useColorScheme } from 'react-native'
import type { Season } from '@daily-prayer/core/churchYear'

// The same colours as the web app (apps/web/src/styles.css).
const light = {
  bg: '#faf8f4',
  card: '#ffffff',
  ink: '#1f1d1a',
  muted: '#6b655c',
  line: '#e6e1d8',
  accent: '#5a3e1b',
  accentSoft: '#f1e9dc',
  sample: '#9a3412',
}
export type Colors = typeof light
const dark: Colors = {
  bg: '#171512',
  card: '#201d19',
  ink: '#ece7df',
  muted: '#a39b8f',
  line: '#36312a',
  accent: '#d9b37a',
  accentSoft: '#2e271e',
  sample: '#fb923c',
}

export const useColors = (): Colors => (useColorScheme() === 'dark' ? dark : light)

/** EB Garamond, loaded in src/app/_layout.tsx. */
export const serif = {
  regular: 'EBGaramond_400Regular',
  italic: 'EBGaramond_400Regular_Italic',
  semibold: 'EBGaramond_600SemiBold',
}

/**
 * A mark for each season. Reformed churches do not keep the colours of the
 * church year, so these are only to tell the seasons apart.
 */
export const SEASON_COLOURS: Record<Season, string> = {
  advent: '#5b4a8b',
  christmas: '#c9a227',
  easter: '#c9a227',
  epiphany: '#4f7a52',
  trinity: '#4f7a52',
  'pre-lent': '#7a3b3b',
  lent: '#7a3b3b',
  'holy-week': '#7a3b3b',
  whitsun: '#b5482c',
}
