import { describe, expect, it } from 'vitest'
import { BIBLES, biblesIn, bibleDir, passageTitle } from '../packages/core/src/bibles.ts'
import { DEFAULT_PREFS, parsePrefs } from '../packages/core/src/prefs.ts'
import { passageText } from '../packages/core/src/resolve.ts'
import { parseBsb, parseOsis } from '../scripts/bibles.ts'

describe('the translations', () => {
  it('keeps the KJV at the root of the calendar, and each other Bible in its own folder', () => {
    expect(bibleDir('kjv')).toBe('')
    expect(bibleDir('bsb')).toBe('bible/bsb/')
    expect(biblesIn('nl').map((b) => b.id)).toEqual(['sv'])
    expect(new Set(BIBLES.map((b) => b.id)).size).toBe(BIBLES.length)
  })

  it('names the book in the language of the Bible', () => {
    expect(passageTitle('Isa.1.1-20')).toBe('Isaiah 1:1–20')
    expect(passageTitle('Isa.1.1-20', 'nl')).toBe('Jesaja 1:1–20')
    expect(passageTitle('Matt.17', 'nl')).toBe('Mattheüs 17')
    expect(passageTitle('Ps.23', 'nl')).toBe('Psalm 23')
  })
})

describe('the settings', () => {
  it('gives the KJV for a Bible that the app does not have, and shows the welcome to a new reader', () => {
    expect(parsePrefs(JSON.stringify({ bible: 'niv' })).bible).toBe('kjv')
    expect(parsePrefs(JSON.stringify({ bible: 'sv' })).bible).toBe('sv')
    expect(parsePrefs(null).onboarded).toBe(false)
    expect(DEFAULT_PREFS.bible).toBe('kjv')
  })
})

describe('the parsers', () => {
  it('reads the BSB text file, with "" for a verse that the BSB leaves out', () => {
    const bible = parseBsb('﻿Header\t\nVerse\tBerean Standard Bible\r\nMatthew 17:20\tA.\r\nMatthew 17:21\t\r\nMatthew 17:22\tB.\r\nPsalm 23:1\tThe LORD\r\n')
    expect(bible.get('Matt')![16].slice(19)).toEqual(['A.', '', 'B.'])
    expect(bible.get('Ps')![22][0]).toBe('The LORD')
  })

  it('reads the OSIS Statenvertaling without the notes, the markup or the old verse numbers', () => {
    const xml =
      '<verse osisID="Ps.3.1">Een <w lemma="strong:H4210">psalm</w>. [03:2] O <divineName>Heere</divineName>!<note><catchWord>x</catchWord> Een noot.</note></verse>' +
      '<verse osisID="Ps.3.2">Velen &amp; meer.</verse>'
    const bible = parseOsis(xml)
    expect(bible.get('Ps')![2]).toEqual(['Een psalm. O Heere!', 'Velen & meer.'])
  })

  it('leaves out an empty verse in another translation, and keeps the KJV strict', async () => {
    const book = async () => [['a', '', 'c']]
    const other = await passageText('Gen.1.1-4', { book, translation: 'the BSB', doc: async () => ({ units: [] }), psalm: async () => ({ stanzas: [] }) })
    expect(other.verses.map((v) => v.verse)).toEqual([1, 3])
    await expect(passageText('Gen.1.1-4', { book, doc: async () => ({ units: [] }), psalm: async () => ({ stanzas: [] }) })).rejects.toThrow('has 3 verses')
  })
})

describe('a selection of verses', () => {
  it('gives a passage in either order, in one chapter or across two', async () => {
    const { verseRange } = await import('../packages/core/src/passage.ts')
    expect(verseRange('Ps', { chapter: 139, verse: 4 }, { chapter: 139, verse: 3 })).toBe('Ps.139.3-4')
    expect(verseRange('John', { chapter: 3, verse: 16 }, { chapter: 3, verse: 16 })).toBe('John.3.16')
    expect(verseRange('Gen', { chapter: 1, verse: 30 }, { chapter: 2, verse: 3 })).toBe('Gen.1.30-2.3')
  })
})

describe('the psalter of 1773', () => {
  it('reads the stanzas of the DBNL text without the page breaks or the pause marks', async () => {
    const { parse1773 } = await import('../scripts/import-psalter-1773.ts')
    const xml =
      'Het boek der psalmen.</head><div type="psalcap"><interpGrp><interp type="primair" value="bibpsal001"/></interpGrp>' +
      '<head>§1</head>\n<lg type="poem"><l>Welzalig hij, die <pb ed="fol." n="1r"/>in der boozen raad</l><l><hi rend="centreren">PAUZE.</hi></l><l>1. PAUZE.</l></lg>' +
      '<div type="chapter"><interpGrp><interp type="primair" value="bibpsal000"/></interpGrp><head>§1</head><lg type="poem"><l>Een gezang</l></lg>'
    expect(parse1773(xml)).toEqual({ 1: [{ number: 1, lines: ['Welzalig hij, die in der boozen raad'] }] })
  })

  it('heads a Dutch psalm with its stanzas, and takes each stanza of a whole psalm', async () => {
    const { psalmHeading, psalmShortLabel } = await import('../packages/core/src/bibles.ts')
    const { psalmText } = await import('../packages/core/src/resolve.ts')
    const reading = { portion: { psalm: 119, verses: [33, 72] as [number, number] }, text: { stanzas: [{ number: 17, verses: [33, 34], lines: [] }, { number: 36, verses: [71, 72], lines: [] }] } }
    expect(psalmHeading(reading, 'nl')).toBe('Psalm 119, vers 17–36')
    expect(psalmShortLabel(reading, 'nl')).toBe('119: 17–36')
    expect(psalmHeading(reading, 'en')).toBe('Psalm 119, verses 33–72')
    const psalm = { stanzas: [0, 1, 2].map((n) => ({ number: n, biblical_verses: [], lines: [{ text: { reading: `r${n}` } }] })) }
    const text = await psalmText({ psalm: 18 }, { book: async () => [], doc: async () => ({ units: [] }), psalm: async () => psalm })
    expect(text.stanzas.map((s) => s.number)).toEqual([0, 1, 2])
  })
})
