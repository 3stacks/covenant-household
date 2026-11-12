// Names and labels that both apps show.

import type { Season } from './churchYear.ts'
import type { ConfessionDoc, PsalmPortion } from './types.ts'

export const DOC_NAMES: Record<ConfessionDoc, string> = {
  wcf: 'Westminster Confession of Faith',
  wlc: 'Westminster Larger Catechism',
  wsc: 'Westminster Shorter Catechism',
  hc: 'Heidelberg Catechism',
  bc: 'Belgic Confession',
  dort: 'Canons of Dort',
}

export const DOC_SHORT: Record<ConfessionDoc, string> = { wcf: 'WCF', wlc: 'WLC', wsc: 'WSC', hc: 'HC', bc: 'BC', dort: 'CD' }

/** "wcf-1.1" → "1.1", "wsc-1" → "Q. 1", "bc-1" → "Art. 1", "dort-3-4-a1" → "III/IV, Art. 1". */
export function unitLabel(doc: ConfessionDoc, unitId: string): string {
  const rest = unitId.slice(doc.length + 1)
  if (doc === 'wcf') return rest
  if (doc === 'bc') return `Art. ${rest}`
  if (doc === 'dort') {
    const m = rest.match(/^(1|2|3-4|5)-([ar])(\d+)$/)
    if (!m) return rest
    const head = { '1': 'I', '2': 'II', '3-4': 'III/IV', '5': 'V' }[m[1]]
    return `${head}, ${m[2] === 'a' ? 'Art.' : 'Rejection'} ${m[3]}`
  }
  return `Q. ${rest}`
}

/** "23" or "119:1–8". */
export const psalmLabel = (p: PsalmPortion) => (p.verses ? `${p.psalm}:${p.verses[0]}–${p.verses[1]}` : String(p.psalm))

/** "Psalm 23 (second version), verses 1–4". */
export function psalmTitle(p: PsalmPortion): string {
  const name = `Psalm ${p.psalm}${p.secondVersion ? ' (second version)' : ''}`
  return p.verses ? `${name}, verses ${p.verses[0]}–${p.verses[1]}` : name
}

export const SIB_NOTES = 'Self-Interpreting Bible notes'

export const SEASON_NAMES: Record<Season, string> = {
  advent: 'Advent',
  christmas: 'Christmas',
  epiphany: 'Epiphany',
  'pre-lent': 'Before Lent',
  lent: 'Lent',
  'holy-week': 'Holy Week',
  easter: 'Easter',
  whitsun: 'Whitsun',
  trinity: 'Trinity',
}

/**
 * The name that a calendar row shows for a weekday: the name of a feast only.
 * The week heading names the Sunday, and an ordinary weekday has no name of its own.
 */
export const feastName = (date: Date, name: string) =>
  date.getDay() !== 0 && !/ after /.test(name) && !/^\w+, \d+ \w+$/.test(name) ? name : undefined
