import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { addDays, type LoadedDay } from '@daily-prayer/core/calendar'
import { DOC_NAMES, DOC_SHORT, psalmLabel, psalmTitle, SIB_NOTES, unitLabel } from '@daily-prayer/core/labels'
import { learnInHearers, memoriseInHearers, psalmPassage, readInHaddington, singPsalm } from '@daily-prayer/core/links'
import { bibleById, DEFAULT_BIBLE, passageTitle, type Bible } from '@daily-prayer/core/bibles'
import { verseRange } from '@daily-prayer/core/passage'
import type { Prefs } from '@daily-prayer/core/prefs'
import type { PassageId, ConfessionDoc, ConfessionUnitText, Hymn, LessonText, PassageText, Paragraph, PsalmPortion, PsalmReading, Source, Writing } from '@daily-prayer/core/types'
import { calendar } from '../lib/calendar.ts'
import { calendarHref, dayHref } from '../router.ts'

/** A day in one translation. The page shows "Loading" until the day is in the translation of the settings. */
type Load = { state: 'loading' } | { state: 'ready'; day: LoadedDay; bible: string } | { state: 'error'; bible: string }

/** The translation of the readings on this page. */
const BibleContext = createContext<Bible>(bibleById(DEFAULT_BIBLE)!)

export function DayView({ date, today, prefs }: { date: Date; today: boolean; prefs: Prefs }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  useEffect(() => {
    let live = true
    const bible = prefs.bible
    calendar.loadDay(date, bible).then(
      (day) => live && setLoad({ state: 'ready', day, bible }),
      () => live && setLoad({ state: 'error', bible }),
    )
    return () => {
      live = false
    }
  }, [date, prefs.bible])

  const shown: Load = load.state !== 'loading' && load.bible !== prefs.bible ? { state: 'loading' } : load
  const day = shown.state === 'ready' ? shown.day : undefined
  const person = prefs.commemoration ? day?.commemoration : undefined
  const dev = day?.devotions
  const bible = bibleById(prefs.bible) ?? bibleById(DEFAULT_BIBLE)!
  const morningRef = useRef<HTMLElement>(null)
  const eveningRef = useRef<HTMLElement>(null)
  const jump = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <article className={`day season-${day?.church.season ?? 'none'}`}>
      <DateHeader date={date} today={today} churchDay={day?.church.name} />
      {day?.holyDayName && (
        <p className="commemoration">
          <span className="label">{date.getDay() === 0 ? 'Also' : 'Holy day'}</span> {day.holyDayName}
        </p>
      )}
      {person && (
        <p className="commemoration">
          <span className="label">Commemoration</span> {person.name}
          {person.years && <span className="muted"> ({person.years})</span>}
          {person.title && <span className="muted">, {person.title}</span>}
        </p>
      )}
      <MemoriseSelection />
      {shown.state === 'loading' && <p className="empty">Loading…</p>}
      {shown.state === 'error' && <p className="empty">The readings did not load. Check the connection, then try again.</p>}
      {day && (
        <BibleContext.Provider value={bible}>
          <nav className="offices" aria-label="Morning and evening worship">
            <button type="button" onClick={() => jump(morningRef.current)}>
              Morning
            </button>
            <button type="button" onClick={() => jump(eveningRef.current)}>
              Evening
            </button>
          </nav>

          <Office title="Morning worship" ref={morningRef}>
            <PsalmSection when="this morning" psalms={day.psalter.morning} />
            <LessonSection title="Old Testament" lesson={day.lessons?.morning?.first} />
            <LessonSection title="New Testament" lesson={day.lessons?.morning?.second} />
            {day.propers && (day.propers.epistle || day.propers.gospel) && (
              <Section title="Epistle and Gospel">
                <p className="propers-title">{day.propers.title.replace(/\.$/, '')}</p>
                {day.propers.epistle && <Passage text={day.propers.epistle} label="The Epistle" />}
                {day.propers.gospel && <Passage text={day.propers.gospel} label="The Gospel" />}
              </Section>
            )}
            <PrayerSection collect={day.collect} prayer={dev?.prayer} />
          </Office>

          <Office title="Evening worship" ref={eveningRef}>
            <PsalmSection when="this evening" psalms={day.psalter.evening} />
            <LessonSection title="Old Testament" lesson={day.lessons?.evening?.first} />
            <LessonSection title="New Testament" lesson={day.lessons?.evening?.second} />
            <PrayerSection collect={day.collect} />
          </Office>

          {((prefs.proverb && dev?.proverb) || dev?.writing || dev?.hymn || dev?.confession || person?.writing) && (
            <Office title="For the household">
              {prefs.proverb && dev?.proverb && dev.texts.proverb && (
                <Section title="Proverb">
                  <Passage text={dev.texts.proverb} note={dev.proverb.note} />
                </Section>
              )}
              {dev?.writing && <WritingSection label="Writing" writing={dev.writing} />}
              {dev?.hymn && <HymnSection hymn={dev.hymn} />}
              {dev?.confession && dev.texts.confession && <ConfessionSection doc={dev.confession.doc} units={dev.texts.confession} />}
              {person?.writing && <WritingSection label={`About ${person.name}`} writing={person.writing} />}
            </Office>
          )}

          <p className="lectionary">
            Lessons: <SourceName source={day.sources.lessons} /> · Collect, Epistle and Gospel: the Book of Common Prayer
            (1662) · Psalms: the 1662 order, sung from the 1650 Psalter · Bible: {bible.name}
          </p>
        </BibleContext.Provider>
      )}
    </article>
  )
}

const key = (p: PsalmPortion) => `${p.psalm}${p.verses ? `:${p.verses[0]}` : ''}`

function DateHeader({ date, today, churchDay }: { date: Date; today: boolean; churchDay?: string }) {
  const long = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <header className="date">
      <a className="step" href={dayHref(addDays(date, -1))} aria-label="Previous day">
        ‹
      </a>
      <div>
        <a className="to-calendar" href={calendarHref(date)} aria-label="Open the calendar for this month">
          <h1>{long}</h1>
          {churchDay && <p className="church-day">{churchDay}</p>}
          <span className="cal-hint">Calendar</span>
        </a>
        {!today && (
          <a className="small" href="#/">
            Go to today
          </a>
        )}
      </div>
      <a className="step" href={dayHref(addDays(date, 1))} aria-label="Next day">
        ›
      </a>
    </header>
  )
}

/**
 * The verses of a selection inside one reading, as a passage. A stanza of a
 * metrical psalm gives the Bible verses that it covers.
 */
function selectedPassage(): PassageId | undefined {
  const sel = document.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return undefined
  const range = sel.getRangeAt(0)
  const at = (n: Node | null) => (n instanceof Element ? n : n?.parentElement)?.closest<HTMLElement>('.reading[data-book]')
  const reading = at(range.startContainer)
  if (!reading || reading !== at(range.endContainer)) return undefined
  const book = reading.dataset.book!
  const verses: { chapter: number; verse: number }[] = []
  for (const el of reading.querySelectorAll<HTMLElement>('[data-verse], [data-verses]')) {
    if (!range.intersectsNode(el)) continue
    if (el.dataset.verse) verses.push({ chapter: +el.dataset.chapter!, verse: +el.dataset.verse })
    else for (const v of el.dataset.verses!.split(' ')) verses.push({ chapter: +reading.dataset.chapter!, verse: +v })
  }
  if (!verses.length) return undefined
  const order = (v: { chapter: number; verse: number }) => v.chapter * 1000 + v.verse
  verses.sort((a, b) => order(a) - order(b))
  return verseRange(book, verses[0], verses[verses.length - 1])
}

/** After the reader selects verses, a bar offers to memorise them in Hearers. */
function MemoriseSelection() {
  const [passage, setPassage] = useState<PassageId>()
  useEffect(() => {
    const update = () => setPassage(selectedPassage())
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [])
  if (!passage) return null
  return (
    <div className="memorise-bar" role="region" aria-label="Memorise the selection">
      <a href={memoriseInHearers(passage)} target="_blank" rel="noopener" data-event="Memorise in Hearers" data-event-label="selection">
        Memorise {passageTitle(passage)} in Hearers
      </a>
    </div>
  )
}

/** Morning worship, evening worship, or the parts for the household. */
function Office({ title, children, ref }: { title: string; children: ReactNode; ref?: React.Ref<HTMLElement> }) {
  return (
    <section className="office" ref={ref}>
      <h2 className="office-title">{title}</h2>
      {children}
    </section>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="part">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

/** An optional reading, closed until the reader opens it. */
function More({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="more">
      <summary>{summary}</summary>
      {children}
    </details>
  )
}

function Links({ children }: { children: ReactNode }) {
  return <p className="links">{children}</p>
}

function Out({ href, children, event }: { href?: string; children: ReactNode; event: string }) {
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noopener" data-event={event}>
      {children}
    </a>
  )
}

/** The psalms of one office in the 1662 order. Sing the first. The others are closed. */
function PsalmSection({ when, psalms }: { when: string; psalms: PsalmReading[] }) {
  if (!psalms.length) return null
  const [first, ...rest] = psalms
  return (
    <Section title="Psalms">
      <Psalm reading={first} />
      {rest.length > 0 && (
        <More summary={`More psalms ${when}: ${rest.map((p) => psalmLabel(p.portion)).join(', ')}`}>
          {rest.map((p) => (
            <Psalm key={key(p.portion)} reading={p} />
          ))}
        </More>
      )}
    </Section>
  )
}

function PrayerSection({ collect, prayer }: { collect?: LoadedDay['collect']; prayer?: { title?: string; text: Paragraph[]; source: Source } }) {
  if (!collect?.collects && !prayer) return null
  return (
    <Section title="Prayer">
      {collect?.collects && (
        <>
          <h3>The Collect</h3>
          <p className="byline">{collect.title.replace(/\.$/, '')}</p>
          <Paragraphs text={collect.collects} />
          <p className="source">The Book of Common Prayer (1662)</p>
        </>
      )}
      {prayer && (
        <div className="reading">
          {prayer.title && <h3>{prayer.title}</h3>}
          <Paragraphs text={prayer.text} />
          <SourceLine source={prayer.source} />
        </div>
      )}
    </Section>
  )
}

function Psalm({ reading }: { reading: PsalmReading }) {
  const { portion, text } = reading
  const passage = psalmPassage(portion)
  return (
    <div className="reading" data-book="Ps" data-chapter={portion.psalm}>
      <h3>{psalmTitle(portion)}</h3>
      <ol className="stanzas">
        {text.stanzas.map((s) => (
          <li key={s.number} value={s.number} data-verses={s.verses.join(' ')}>
            {s.lines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </li>
        ))}
      </ol>
      <p className="source">The Psalms of David in Metre (1650)</p>
      <Links>
        <Out href={singPsalm(portion)} event="Sing in Precentor">
          Sing in Precentor
        </Out>
        <Out href={readInHaddington(passage)} event="Read in Haddington">
          {SIB_NOTES}
        </Out>
        <Out href={memoriseInHearers(passage)} event="Memorise in Hearers">
          Memorise in Hearers
        </Out>
      </Links>
    </div>
  )
}

function LessonSection({ title, lesson }: { title: string; lesson?: LessonText }) {
  return (
    <Section title={title}>
      {lesson ? <Lesson lesson={lesson} /> : <p className="note">The 1922 table has no lesson for this day in the transcription.</p>}
    </Section>
  )
}

function Lesson({ lesson }: { lesson: LessonText }) {
  if (!lesson.parts.length) {
    return (
      <div className="reading">
        <h3>{lesson.apocrypha}</h3>
        <p className="note">
          The 1922 table appoints this lesson from the Apocrypha. The Apocrypha is not part of the canon of Scripture (WCF
          1.3), so this app does not read it.
        </p>
      </div>
    )
  }
  return (
    <>
      {lesson.parts.map((p) => (
        <Passage key={p.passage} text={p} />
      ))}
      {lesson.apocrypha && <p className="note">In place of {lesson.apocrypha}. The 1922 table appoints that lesson from the Apocrypha.</p>}
    </>
  )
}

function Passage({ text, label, note }: { text: PassageText; label?: string; note?: string }) {
  const id = text.passage
  const bible = useContext(BibleContext)
  return (
    <div className="reading" data-book={id.split('.')[0]}>
      <h3>
        {label && <span className="label">{label}</span>}
        {passageTitle(id, bible.language)}
      </h3>
      <p className="scripture">
        {text.verses.map((v, i) => {
          const newChapter = i > 0 && v.chapter !== text.verses[i - 1].chapter
          return (
            <span key={`${v.chapter}.${v.verse}`} data-chapter={v.chapter} data-verse={v.verse}>
              {newChapter && <span className="chapter">Chapter {v.chapter}</span>}
              <sup>{v.verse}</sup>
              {v.text}{' '}
            </span>
          )
        })}
      </p>
      {note && <p className="note">{note}</p>}
      <p className="source">{bible.name}</p>
      <Links>
        <Out href={readInHaddington(id)} event="Read in Haddington">
          {SIB_NOTES}
        </Out>
        <Out href={memoriseInHearers(id)} event="Memorise in Hearers">
          Memorise in Hearers
        </Out>
      </Links>
    </div>
  )
}

function WritingSection({ label, writing }: { label: string; writing: Writing }) {
  return (
    <Section title={label}>
      <h3>{writing.title}</h3>
      <p className="byline">
        {writing.author}, <cite>{writing.work}</cite>
        {writing.year && ` (${writing.year})`}
        {writing.topic && <span className="tag">{writing.topic}</span>}
      </p>
      <Paragraphs text={writing.text} />
      <SourceLine source={writing.source} />
    </Section>
  )
}

function HymnSection({ hymn }: { hymn: Hymn }) {
  const details = [hymn.author, hymn.tune && `Tune: ${hymn.tune}`, hymn.metre].filter(Boolean).join(' · ')
  return (
    <Section title="Hymn">
      <h3>{hymn.title}</h3>
      {details && <p className="byline">{details}</p>}
      {hymn.stanzas ? (
        <ol className="stanzas">
          {hymn.stanzas.map((lines, i) => (
            <li key={i}>
              {lines.map((line, j) => (
                <span key={j}>{line}</span>
              ))}
            </li>
          ))}
        </ol>
      ) : (
        hymn.hymnal && (
          <p className="note">
            Sing from <cite>{hymn.hymnal.name}</cite>, number {hymn.hymnal.number}.
          </p>
        )
      )}
      <SourceLine source={hymn.source} />
    </Section>
  )
}

function ConfessionSection({ doc, units }: { doc: ConfessionDoc; units: ConfessionUnitText[] }) {
  return (
    <Section title="Confession">
      <h3>{DOC_NAMES[doc]}</h3>
      {units.map((u) => (
        <div key={u.id} className="unit">
          <p className="unit-head">
            <span className="unit-ref">{unitLabel(doc, u.id)}</span>
            {u.prompt && <span className="prompt">{u.prompt}</span>}
          </p>
          <p className="unit-text">{u.text}</p>
        </div>
      ))}
      <Links>
        {units.map((u) => (
          <Out key={u.id} href={learnInHearers(doc, u.id)} event="Learn in Hearers">
            Learn {DOC_SHORT[doc]} {unitLabel(doc, u.id)} in Hearers
          </Out>
        ))}
      </Links>
    </Section>
  )
}

function Paragraphs({ text }: { text: Paragraph[] }) {
  return (
    <div className="text">
      {text.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

function SourceName({ source }: { source: Source }) {
  return (
    <>
      {source.licence === 'sample' && <span className="sample">Sample</span>}
      {source.url ? (
        <a href={source.url} target="_blank" rel="noopener">
          {source.name}
        </a>
      ) : (
        source.name
      )}
    </>
  )
}

function SourceLine({ source }: { source: Source }) {
  return (
    <p className="source">
      <SourceName source={source} />
    </p>
  )
}
