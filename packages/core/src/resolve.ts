// Adds the text of each reading. The build script uses this module, with sources
// that read the published data of Hearers and Precentor.

import { parsePassage } from './passage.ts'
import type {
  CollectDay,
  CollectsFile,
  ConfessionDoc,
  ConfessionUnitText,
  Devotions,
  DevotionsFile,
  Lesson,
  LessonDay,
  LessonsFile,
  LessonText,
  PassageId,
  PassageText,
  PsalmPortion,
  PsalmText,
  PsalterFile,
  VerseText,
} from './types.ts'

/** A Precentor psalm file (open-1650 format). Only the fields that this module uses. */
export interface PrecentorPsalm {
  stanzas: { number: number; biblical_verses: number[]; lines: { text: { reading: string } }[] }[]
}

/** A Hearers document file. Only the fields that this module uses. */
export interface HearersDoc {
  units: { id: string; ref: string; prompt?: string; text: string }[]
}

export interface Sources {
  /**
   * The text of a book in KJV verse numbers: chapters, then verses. Index 0 is
   * chapter 1, verse 1. Another translation has "" for a verse that it leaves out.
   */
  book(code: string): Promise<string[][]>
  /**
   * The name of a translation other than the KJV. Then a verse past the end of
   * a chapter, or a verse with no text, is left out, not an error.
   */
  translation?: string
  doc(id: ConfessionDoc): Promise<HearersDoc>
  /** A psalm by its Precentor key, for example "023" or "124b". */
  psalm(key: string): Promise<PrecentorPsalm>
}

export async function passageText(id: PassageId, sources: Sources): Promise<PassageText> {
  const p = parsePassage(id)
  if (!p) throw new Error(`"${id}" is not a valid passage.`)
  const chapters = await sources.book(p.book.code)
  const bible = sources.translation ?? 'the KJV'
  const verses: VerseText[] = []
  for (let c = p.c1; c <= p.c2; c++) {
    const chapter = chapters[c - 1]
    if (!chapter) throw new Error(`${id}: ${bible} has no chapter ${c}.`)
    const first = p.v1 && c === p.c1 ? p.v1 : 1
    let last = p.v2 && c === p.c2 ? p.v2 : chapter.length
    if (last > chapter.length) {
      if (!sources.translation) throw new Error(`${id}: ${p.book.name} ${c} has ${chapter.length} verses.`)
      last = chapter.length
    }
    for (let v = first; v <= last; v++) {
      const text = chapter[v - 1]
      if (text || !sources.translation) verses.push({ chapter: c, verse: v, text })
    }
  }
  if (verses.length === 0) throw new Error(`${id}: ${bible} has no text for this passage.`)
  return { passage: id, verses }
}

export async function psalmText(portion: PsalmPortion, sources: Sources): Promise<PsalmText> {
  const key = `${String(portion.psalm).padStart(3, '0')}${portion.secondVersion ? 'b' : ''}`
  const psalm = await sources.psalm(key)
  // A whole psalm takes each stanza. A part takes the stanzas of its verses.
  const [first, last] = portion.verses ?? [1, Infinity]
  const stanzas = psalm.stanzas
    .filter((s) => !portion.verses || s.biblical_verses.some((v) => v >= first && v <= last))
    .map((s) => ({ number: s.number, verses: s.biblical_verses, lines: s.lines.map((l) => l.text.reading) }))
  if (stanzas.length === 0) throw new Error(`Psalm ${portion.psalm} has no stanza for verses ${first}–${last}.`)
  return { stanzas }
}

export async function confessionText(doc: ConfessionDoc, units: string[], sources: Sources): Promise<ConfessionUnitText[]> {
  const byId = new Map((await sources.doc(doc)).units.map((u) => [u.id, u]))
  return units.map((id) => {
    const u = byId.get(id)
    if (!u) throw new Error(`Hearers has no unit "${id}".`)
    return { id, ref: u.ref, prompt: u.prompt, text: u.text }
  })
}

async function lessonText(lesson: Lesson, sources: Sources): Promise<LessonText> {
  const parts = await Promise.all(lesson.passages.map((p) => passageText(p, sources)))
  return lesson.apocrypha ? { parts, apocrypha: lesson.apocrypha } : { parts }
}

export async function resolveLessons(id: string, day: LessonDay, sources: Sources): Promise<LessonsFile> {
  const office = async (o: LessonDay['morning']) => o && { first: await lessonText(o.first, sources), second: await lessonText(o.second, sources) }
  const out: LessonsFile = { id, label: day.label }
  const morning = await office(day.morning)
  const evening = await office(day.evening)
  if (morning) out.morning = morning
  if (evening) out.evening = evening
  return out
}

export async function resolveCollects(id: string, day: CollectDay, sources: Sources): Promise<CollectsFile> {
  const out: CollectsFile = { id, title: day.title }
  if (day.collects) out.collects = day.collects
  if (day.epistle) out.epistle = await passageText(day.epistle, sources)
  if (day.gospel) out.gospel = await passageText(day.gospel, sources)
  return out
}

export async function resolvePsalter(day: number, psalms: { morning: PsalmPortion[]; evening: PsalmPortion[] }, sources: Sources): Promise<PsalterFile> {
  const read = (list: PsalmPortion[]) => Promise.all(list.map(async (portion) => ({ portion, text: await psalmText(portion, sources) })))
  return { day, morning: await read(psalms.morning), evening: await read(psalms.evening) }
}

export async function resolveDevotions(d: Devotions, sources: Sources): Promise<DevotionsFile> {
  const texts: DevotionsFile['texts'] = {}
  if (d.proverb) texts.proverb = await passageText(d.proverb.passage, sources)
  if (d.confession) texts.confession = await confessionText(d.confession.doc, d.confession.units, sources)
  return { ...d, texts }
}
