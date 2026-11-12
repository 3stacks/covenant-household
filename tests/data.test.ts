import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseReference } from '../scripts/refs.ts'
import { dateKey, parseIsoDate, psalterDay } from '../packages/core/src/calendar.ts'
import { adventSunday, allLessonIds, churchDay, easter } from '../packages/core/src/churchYear.ts'
import { formatPassageId, parsePassage } from '../packages/core/src/passage.ts'
import { resolveDevotions, resolveLessons, resolvePsalter, type Sources } from '../packages/core/src/resolve.ts'
import type { Collects, Lectionary, Psalter } from '../packages/core/src/types.ts'
import { validateCommemoration, validateDevotions } from '../packages/core/src/validate.ts'
import { learnInHearers, memoriseInHearers, psalmPassage, readInHaddington, singPsalm } from '../packages/core/src/links.ts'
import { parseRoute } from '../packages/core/src/routes.ts'
import { unitLabel } from '../packages/core/src/labels.ts'

const content = <T>(path: string) => JSON.parse(readFileSync(new URL(`../content/${path}`, import.meta.url), 'utf8')) as T

describe('passages', () => {
  it('formats each form of passage id', () => {
    expect(formatPassageId('Ps.23')).toBe('Psalm 23')
    expect(formatPassageId('Rom.8.28-30')).toBe('Romans 8:28–30')
    expect(formatPassageId('Gen.1.1-2.3')).toBe('Genesis 1:1–2:3')
    expect(formatPassageId('Heb.8-10')).toBe('Hebrews 8–10')
    expect(formatPassageId('Ps.90-91')).toBe('Psalms 90–91')
  })

  it('rejects unknown books, chapters out of range and reversed ranges', () => {
    expect(parsePassage('Xyz.1')).toBeUndefined()
    expect(parsePassage('Gen.51')).toBeUndefined()
    expect(parsePassage('Rom.8.30-28')).toBeUndefined()
    expect(parsePassage('Rom 8:28')).toBeUndefined()
  })
})

describe('references in the 1922 transcription', () => {
  // A small table of verse counts for the tests.
  const counts: Record<string, number[]> = { Gen: [31, 25, 24], Mal: [14, 17, 18, 6], John: [51, 25, 36], Deut: [], Isa: [31, 22, 26] }
  counts.Deut[31] = 52
  const verses = (code: string, c: number) => counts[code]?.[c - 1]

  it('reads each form', () => {
    expect(parseReference('Isaiah 1:1-20', verses)).toEqual(['Isa.1.1-20'])
    expect(parseReference('Isaiah 2:', verses)).toEqual(['Isa.2'])
    expect(parseReference('Genesis 3:5-999', verses)).toEqual(['Gen.3.5-24'])
    expect(parseReference('Genesis 1:1-3;12-29', verses)).toEqual(['Gen.1.1-3', 'Gen.1.12-29'])
    expect(parseReference('Genesis 1:26;2', verses)).toEqual(['Gen.1.26-31', 'Gen.2'])
    expect(parseReference('Malachi 3:13-4', verses)).toEqual(['Mal.3.13-4.6'])
    expect(parseReference('Deuteronomy 32:48-999;Deuteronomy 34', verses)).toEqual(['Deut.32.48-52', 'Deut.34'])
    expect(parseReference('Jude', verses)).toEqual(['Jude.1'])
    expect(parseReference('2Peter 1', verses)).toEqual(['2Pet.1'])
    expect(parseReference('John1:1-20', verses)).toEqual(['John.1.1-20'])
    expect(parseReference('Acts:27:1-26', verses)).toEqual(['Acts.27.1-26'])
    expect(parseReference('John 2.1-11', verses)).toEqual(['John.2.1-11'])
    expect(parseReference('Galatians 4-5:1', verses)).toEqual(['Gal.4.1-5.1'])
    expect(parseReference('Prov. 3:1-26', verses)).toEqual(['Prov.3.1-26'])
  })
})

describe('links into the suite', () => {
  it('builds Precentor, Self-Interpreting Bible and Hearers links', () => {
    expect(singPsalm({ psalm: 23 })).toBe('https://precentor.app/#/psalm/023')
    expect(singPsalm({ psalm: 124, secondVersion: true })).toBe('https://precentor.app/#/psalm/124b')
    expect(psalmPassage({ psalm: 119, verses: [1, 32] })).toBe('Ps.119.1-32')
    expect(readInHaddington('Rom.8.28-30')).toBe('https://haddingtonbible.org/romans-8#v8-28')
    expect(readInHaddington('2Tim.4')).toBe('https://haddingtonbible.org/2-timothy-4')
    expect(memoriseInHearers('Rom.8.28-30')).toBe('https://hearers.app/app/#/add/Rom.8.28-30')
    expect(learnInHearers('wcf', 'wcf-1.1')).toBe('https://hearers.app/app/#/unit/wcf/wcf-1.1')
  })

  it('labels each kind of confession unit', () => {
    expect(unitLabel('wcf', 'wcf-11.1')).toBe('11.1')
    expect(unitLabel('wsc', 'wsc-21')).toBe('Q. 21')
    expect(unitLabel('bc', 'bc-22')).toBe('Art. 22')
    expect(unitLabel('dort', 'dort-3-4-a1')).toBe('III/IV, Art. 1')
    expect(unitLabel('dort', 'dort-5-r2')).toBe('V, Rejection 2')
  })
})

describe('church year (1662)', () => {
  const day = (y: number, m: number, d: number) => churchDay(new Date(y, m - 1, d))

  it('finds Easter and Advent Sunday', () => {
    const same = (a: Date, b: Date) => expect(a.toDateString()).toBe(b.toDateString())
    same(easter(2024), new Date(2024, 2, 31))
    same(easter(2026), new Date(2026, 3, 5))
    same(easter(2038), new Date(2038, 3, 25))
    same(adventSunday(2025), new Date(2025, 10, 30))
    same(adventSunday(2026), new Date(2026, 10, 29))
  })

  it('names the days of 2026 and chooses their collects', () => {
    expect(day(2026, 1, 6)).toMatchObject({ id: 'jan-06', name: 'The Epiphany', propers: 'jan-06' })
    expect(day(2026, 1, 7)).toMatchObject({ id: 'epiphany-0-3', collect: 'jan-06' })
    expect(day(2026, 2, 1)).toMatchObject({ id: 'septuagesima-0', name: 'Septuagesima' })
    expect(day(2026, 2, 17)).toMatchObject({ id: 'quinquagesima-2', collect: 'quinquagesima-0' })
    expect(day(2026, 2, 18)).toMatchObject({ id: 'lent-0-3', name: 'Ash Wednesday', collect: 'lent-0-3' })
    expect(day(2026, 2, 19)).toMatchObject({ id: 'lent-0-4', collect: 'lent-0-3' })
    expect(day(2026, 3, 29)).toMatchObject({ id: 'holy-week-0', name: 'The Sunday next before Easter' })
    expect(day(2026, 3, 30)).toMatchObject({ id: 'holy-week-1', collect: 'holy-week-0', propers: 'holy-week-1' })
    expect(day(2026, 4, 3)).toMatchObject({ id: 'holy-week-5', name: 'Good Friday' })
    expect(day(2026, 4, 5)).toMatchObject({ id: 'easter-0-0', name: 'Easter Day' })
    expect(day(2026, 5, 14)).toMatchObject({ id: 'easter-5-4', name: 'Ascension Day' })
    expect(day(2026, 5, 15)).toMatchObject({ id: 'easter-5-5', collect: 'easter-5-4' })
    expect(day(2026, 5, 17)).toMatchObject({ id: 'easter-6-0', name: 'The Sunday after Ascension Day' })
    expect(day(2026, 5, 24)).toMatchObject({ id: 'whitsun-0', name: 'Whitsunday' })
    expect(day(2026, 5, 31)).toMatchObject({ id: 'trinity-0-0', name: 'Trinity Sunday' })
    expect(day(2026, 11, 10)).toMatchObject({ id: 'trinity-23-2', collect: 'trinity-23-0' })
    expect(day(2026, 11, 22)).toMatchObject({ id: 'next-before-advent-0', collect: 'trinity-25-0' })
    expect(day(2026, 11, 29)).toMatchObject({ id: 'advent-1-0', name: 'The First Sunday in Advent' })
    expect(day(2026, 11, 30)).toMatchObject({ id: 'advent-1-1', holyDay: 'holy-11-30', collect: 'holy-11-30' })
    expect(day(2026, 12, 24)).toMatchObject({ id: 'dec-24', collect: 'advent-4-0' })
    expect(day(2026, 12, 29)).toMatchObject({ id: 'dec-29', collect: 'dec-25' })
    expect(day(2027, 1, 3)).toMatchObject({ id: 'christmas-2', collect: 'jan-01' })
  })

  it('applies the rubric for extra Sundays after Trinity', () => {
    // 2027 has 25 numbered Sundays after Trinity. The 25th takes the service of
    // the Sixth Sunday after the Epiphany. The last always takes the 25th.
    expect(day(2027, 11, 14)).toMatchObject({ id: 'trinity-25-0', collect: 'epiphany-6-0' })
    expect(day(2027, 11, 21)).toMatchObject({ id: 'next-before-advent-0', collect: 'trinity-25-0' })
  })

  it('keeps Advent 4 on Christmas Eve when it is a Sunday, and moves Saint Matthias in a leap year', () => {
    expect(day(2023, 12, 24)).toMatchObject({ id: 'advent-4-0' })
    expect(day(2028, 2, 24).holyDay).toBeUndefined()
    expect(day(2028, 2, 25).holyDay).toBe('holy-02-24')
    expect(day(2027, 2, 24).holyDay).toBe('holy-02-24')
  })

  it('has lessons, a collect, propers and devotions for every day of 300 years', () => {
    const lessons = content<Lectionary>('lectionary/1922.json').days
    const collects = content<Collects>('lectionary/1662.json').days
    const devotions = new Set(readdirSync(new URL('../content/devotions', import.meta.url)).map((f) => f.replace(/\.json$/, '')))
    const ids = new Set(allLessonIds())
    const seen = new Set<string>()
    const missing = new Set<string>()
    for (let d = new Date(1900, 0, 1); d.getFullYear() < 2200; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      const x = churchDay(d)
      seen.add(x.id)
      if (!ids.has(x.id)) expect.fail(`${d.toDateString()} → unknown id ${x.id}`)
      if (!lessons[x.id]) missing.add(`lessons ${x.id}`)
      if (!devotions.has(x.id)) missing.add(`devotions ${x.id}`)
      if (!collects[x.collect]?.collects) expect.fail(`${d.toDateString()} → no collect ${x.collect}`)
      if (x.propers && !collects[x.propers]) expect.fail(`${d.toDateString()} → no propers ${x.propers}`)
    }
    expect([...ids].filter((id) => !seen.has(id))).toEqual([])
    expect([...missing]).toEqual([])
  })

  it('reads a canonical lesson in place of each Apocrypha lesson', () => {
    const lessons = content<Lectionary>('lectionary/1922.json').days
    const empty = Object.entries(lessons).flatMap(([id, d]) =>
      (['morning', 'evening'] as const).filter((o) => d[o]?.first.apocrypha && !d[o]!.first.passages.length).map((o) => `${id} ${o}`),
    )
    expect(empty).toEqual([])
  })
})

describe('the 1662 psalter', () => {
  it('reads all 150 psalms each month, and all of Psalm 119', () => {
    const days = content<Psalter>('lectionary/psalter-1662.json').days
    const all = Object.values(days).flatMap((d) => [...d.morning, ...d.evening])
    expect(new Set(all.map((p) => p.psalm)).size).toBe(150)
    const ps119 = all.filter((p) => p.psalm === 119).map((p) => p.verses)
    expect(ps119).toEqual([[1, 32], [33, 72], [73, 104], [105, 144], [145, 176]])
    expect(psalterDay(new Date(2026, 0, 31))).toBe(30)
  })
})

describe('validation', () => {
  const src = { name: 'S', licence: 'public-domain' }

  it('accepts devotions with any of their parts', () => {
    expect(validateDevotions({ id: 'advent-2-3' })).toEqual([])
    expect(validateDevotions({ id: 'advent-2-3', prayer: { text: ['x'], source: src }, confession: { doc: 'wcf', units: ['wcf-1.1'] } })).toEqual([])
  })

  it('reports each problem with its path', () => {
    const bad = { id: 'proper-27-2', proverb: { passage: 'Rom.1.1' }, confession: { doc: 'wcf', units: ['wsc-1'] }, hymn: { title: 'H', source: src } }
    expect(validateDevotions(bad).map((p) => p.path)).toEqual(['id', 'proverb.passage', 'hymn', 'confession.units[0]'])
  })

  it('rejects sample text, and the Heidelberg and Belgic texts, only in a release', () => {
    const sample = { id: 'advent-2-3', prayer: { text: ['x'], source: { name: 'S', licence: 'sample' } } }
    expect(validateDevotions(sample)).toEqual([])
    expect(validateDevotions(sample, { release: true }).map((p) => p.path)).toEqual(['prayer.source.licence'])
    const hc = { id: 'advent-2-3', confession: { doc: 'hc', units: ['hc-1'] } }
    expect(validateDevotions(hc, { release: true }).map((p) => p.path)).toEqual(['confession.doc'])
  })

  it('checks commemorations', () => {
    expect(validateCommemoration({ date: '11-24', id: 'john-knox', name: 'John Knox' })).toEqual([])
    expect(validateCommemoration({ date: '02-30', id: 'John Knox', name: '' }).map((p) => p.path)).toEqual(['date', 'id', 'name'])
  })

  it('accepts every content file', () => {
    for (const [dir, check, key] of [
      ['devotions', validateDevotions, 'id'],
      ['commemorations', validateCommemoration, 'date'],
    ] as const) {
      const url = new URL(`../content/${dir}/`, import.meta.url)
      for (const file of readdirSync(url)) {
        const value = JSON.parse(readFileSync(new URL(file, url), 'utf8'))
        expect({ file, problems: check(value) }).toEqual({ file, problems: [] })
        expect(value[key]).toBe(file.replace('.json', ''))
      }
    }
  })
})

describe('texts', () => {
  const sources: Sources = {
    book: async (code) => (code === 'Gen' ? [['g1v1', 'g1v2', 'g1v3'], ['g2v1', 'g2v2']] : [['a', 'b', 'c', 'd']]),
    doc: async () => ({ units: [{ id: 'wsc-1', ref: 'Q. 1', prompt: 'What?', text: 'This.' }] }),
    psalm: async (key) => ({
      stanzas: [1, 2, 3].map((n) => ({ number: n, biblical_verses: [n * 2 - 1, n * 2], lines: [{ text: { reading: `${key} stanza ${n}` } }] })),
    }),
  }

  it('takes the verses of each lesson part, and keeps the Apocrypha label', async () => {
    const l = await resolveLessons(
      'x',
      {
        label: 'Monday',
        morning: { first: { passages: ['Gen.1.2-2.1'], alternatives: [] }, second: { passages: ['John.1.4'], alternatives: [] } },
        evening: { first: { passages: [], alternatives: [], apocrypha: 'Wisdom 1' }, second: { passages: ['John.1.1-2', 'John.1.4'], alternatives: [] } },
      },
      sources,
    )
    expect(l.morning?.first.parts[0].verses.map((v) => v.text)).toEqual(['g1v2', 'g1v3', 'g2v1'])
    expect(l.evening?.first).toEqual({ parts: [], apocrypha: 'Wisdom 1' })
    expect(l.evening?.second.parts.map((p) => p.verses.length)).toEqual([2, 1])
  })

  it('takes the psalm stanzas and the confession units', async () => {
    const p = await resolvePsalter(24, { morning: [{ psalm: 124, secondVersion: true, verses: [3, 4] }], evening: [] }, sources)
    expect(p.morning[0].text.stanzas.map((s) => s.lines[0])).toEqual(['124b stanza 2'])
    const d = await resolveDevotions({ id: 'advent-1-0', confession: { doc: 'wsc', units: ['wsc-1'] } }, sources)
    expect(d.texts.confession).toEqual([{ id: 'wsc-1', ref: 'Q. 1', prompt: 'What?', text: 'This.' }])
    await expect(resolveDevotions({ id: 'advent-1-0', confession: { doc: 'wsc', units: ['wsc-2'] } }, sources)).rejects.toThrow('wsc-2')
  })
})

describe('dates and routes', () => {
  it('parses dates and routes', () => {
    expect(dateKey(new Date(2026, 10, 10))).toBe('11-10')
    expect(parseIsoDate('2026-02-30')).toBeUndefined()
    const now = new Date(2026, 10, 10)
    expect(parseRoute('#/day/2026-11-24', now)).toMatchObject({ view: 'day', today: false })
    expect(parseRoute('#/day/2026-11-10', now)).toMatchObject({ view: 'day', today: true })
    expect(parseRoute('#/settings', now)).toEqual({ view: 'settings' })
    expect(parseRoute('#/about', now)).toEqual({ view: 'about' })
    expect(parseRoute('#/how', now)).toEqual({ view: 'how' })
    expect(parseRoute('#/calendar/2027-02', now)).toEqual({ view: 'calendar', year: 2027, month: 1 })
    expect(parseRoute('#/calendar', now)).toEqual({ view: 'calendar', year: 2026, month: 10 })
    // The mobile app uses the same paths, with no "#".
    expect(parseRoute('/day/2026-11-24', now)).toMatchObject({ view: 'day', today: false })
    expect(parseRoute('/calendar/2027-13', now)).toEqual({ view: 'calendar', year: 2026, month: 10 })
  })
})
