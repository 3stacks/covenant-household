// Imports the Psalmberijming van 1773, the Dutch metrical psalter, into
// content/psalter/1773.json.
//
// Source: the diplomatic transcription in DBNL of the 1774 Haarlem printing
// (Johannes Enschedé en Zoonen), "Het boek der psalmen, nevens de gezangen bij
// de Hervormde Kerk van Nederland in gebruik". The Bijbeldigitaliseringsproject
// of Nicoline van der Sijs made it in 2010. The text of 1773 is in the public
// domain. The DBNL terms limit only works that are under copyright, and the
// download of many works. This script downloads one work.
//
//   node scripts/import-psalter-1773.ts
//
// The script keeps the spelling of 1774. It removes the page breaks and the
// "PAUZE." marks. Psalm 18 starts with a prelude of four lines, as stanza 0.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getText } from './cache.ts'

export const DBNL_1773 = 'https://www.dbnl.org/nieuws/xml.php?id=_boe008boek01'
const root = fileURLToPath(new URL('..', import.meta.url))

export interface Psalter1773 {
  source: { name: string; url: string; licence: string; note: string }
  /** Psalm number → stanzas. */
  psalms: Record<string, { number: number; lines: string[] }[]>
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#160': ' ' }

function line(raw: string): string {
  return raw
    .replace(/<pb[^>]*\/>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#?\w+);/g, (all, name: string) => ENTITIES[name] ?? all)
    .replace(/\s+/g, ' ')
    .trim()
}

export function parse1773(xml: string): Psalter1773['psalms'] {
  const start = xml.indexOf('Het boek der psalmen.</head>')
  if (start < 0) throw new Error('DBNL: the psalms are missing')
  const psalms: Psalter1773['psalms'] = {}
  // Each psalm is a div "psalcap" with the value bibpsalNNN.
  const caps = [...xml.slice(start).matchAll(/value="bibpsal(\d{3})"\/>/g)]
  for (let i = 0; i < caps.length; i++) {
    const n = +caps[i][1]
    if (n < 1 || n > 150 || psalms[n]) continue
    const from = start + caps[i].index!
    const to = i + 1 < caps.length ? start + caps[i + 1].index! : xml.length
    const body = xml.slice(from, to)
    const stanzas = [...body.matchAll(/<head>§(\d+)<\/head>\s*<lg type="poem">([\s\S]*?)<\/lg>/g)].map((m) => ({
      number: +m[1],
      lines: [...m[2].matchAll(/<l>([\s\S]*?)<\/l>/g)].map((l) => line(l[1])).filter((l) => l && !/^(\d+\. *)?PAUZE\.?$/.test(l)),
    }))
    if (stanzas.length) psalms[n] = stanzas
  }
  return psalms
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const psalms = parse1773(await getText(DBNL_1773))
  const count = Object.keys(psalms).length
  if (count !== 150) throw new Error(`DBNL: ${count} psalms, not 150`)
  if (psalms[119].length !== 88) throw new Error(`DBNL: Psalm 119 has ${psalms[119].length} stanzas, not 88`)
  const out: Psalter1773 = {
    source: {
      name: 'Psalmberijming van 1773, uit Het boek der psalmen (Haarlem, 1774). Diplomatische uitgave in DBNL (2010).',
      url: 'https://www.dbnl.org/titels/titel.php?id=_boe008boek01',
      licence: 'public-domain',
      note: 'The text of 1773 is in the public domain. Consulted through DBNL (KB, national library).',
    },
    psalms,
  }
  const file = join(root, 'content/psalter/1773.json')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(out, null, 1) + '\n')
  const stanzas = Object.values(psalms).reduce((n, p) => n + p.length, 0)
  console.log(`content/psalter/1773.json: 150 psalms, ${stanzas} stanzas`)
}
