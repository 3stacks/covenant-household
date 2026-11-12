import { useEffect, useState, type ReactNode } from 'react'
import { addDays, type LoadedDay } from '@daily-prayer/core/calendar'
import { DOC_NAMES, DOC_SHORT, psalmLabel, psalmTitle, SIB_NOTES, unitLabel } from '@daily-prayer/core/labels'
import { learnInHearers, memoriseInHearers, psalmPassage, readInHaddington, singPsalm } from '@daily-prayer/core/links'
import { formatPassageId } from '@daily-prayer/core/passage'
import type { Prefs } from '@daily-prayer/core/prefs'
import type { ConfessionDoc, ConfessionUnitText, Hymn, LessonText, PassageText, Paragraph, PsalmPortion, PsalmReading, Source, Writing } from '@daily-prayer/core/types'
import { calendar } from '../lib/calendar.ts'
import { calendarHref, dayHref } from '../router.ts'

type Load = { state: 'loading' } | { state: 'ready'; day: LoadedDay } | { state: 'error' }

export function DayView({ date, today, prefs }: { date: Date; today: boolean; prefs: Prefs }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  useEffect(() => {
    let live = true
    calendar.loadDay(date).then(
      (day) => live && setLoad({ state: 'ready', day }),
      () => live && setLoad({ state: 'error' }),
    )
    return () => {
      live = false
    }
  }, [date])

  const day = load.state === 'ready' ? load.day : undefined
  const person = prefs.commemoration ? day?.commemoration : undefined
  const dev = day?.devotions

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
      {load.state === 'loading' && <p className="empty">Loading…</p>}
      {load.state === 'error' && <p className="empty">The readings did not load. Check the connection, then try again.</p>}
      {day && (
        <>
          <Section title="Psalmody">
            {/* The first psalm of Morning Prayer. The other psalms of the day are optional. */}
            {day.psalter.morning[0] && <Psalm reading={day.psalter.morning[0]} />}
            <MorePsalms morning={day.psalter.morning.slice(1)} evening={day.psalter.evening} />
          </Section>

          <LessonSection title="Old Testament" morning={day.lessons?.morning?.first} evening={day.lessons?.evening?.first} />
          <LessonSection title="New Testament" morning={day.lessons?.morning?.second} evening={day.lessons?.evening?.second} />

          {day.propers && (day.propers.epistle || day.propers.gospel) && (
            <Section title="Epistle and Gospel">
              <p className="propers-title">{day.propers.title.replace(/\.$/, '')}</p>
              {day.propers.epistle && <Passage text={day.propers.epistle} label="The Epistle" />}
              {day.propers.gospel && <Passage text={day.propers.gospel} label="The Gospel" />}
            </Section>
          )}

          {prefs.proverb && dev?.proverb && dev.texts.proverb && (
            <Section title="Proverb">
              <Passage text={dev.texts.proverb} note={dev.proverb.note} />
            </Section>
          )}

          {dev?.writing && <WritingSection label="Writing" writing={dev.writing} />}

          {dev?.hymn && <HymnSection hymn={dev.hymn} />}

          {(day.collect?.collects || dev?.prayer) && (
            <Section title="Prayer">
              {day.collect?.collects && (
                <>
                  <h3>The Collect</h3>
                  <p className="byline">{day.collect.title.replace(/\.$/, '')}</p>
                  <Paragraphs text={day.collect.collects} />
                  <p className="source">The Book of Common Prayer (1662)</p>
                </>
              )}
              {dev?.prayer && (
                <div className="reading">
                  {dev.prayer.title && <h3>{dev.prayer.title}</h3>}
                  <Paragraphs text={dev.prayer.text} />
                  <SourceLine source={dev.prayer.source} />
                </div>
              )}
            </Section>
          )}

          {dev?.confession && dev.texts.confession && <ConfessionSection doc={dev.confession.doc} units={dev.texts.confession} />}

          {person?.writing && <WritingSection label={`About ${person.name}`} writing={person.writing} />}

          <p className="lectionary">
            Lessons: <SourceName source={day.sources.lessons} /> · Collect, Epistle and Gospel: the Book of Common Prayer
            (1662) · Psalms: the 1662 order, sung from the 1650 Psalter
          </p>
        </>
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

/** The other psalms of the day in the 1662 order, closed. */
function MorePsalms({ morning, evening }: { morning: PsalmReading[]; evening: PsalmReading[] }) {
  const list = (ps: PsalmReading[]) => ps.map((p) => psalmLabel(p.portion)).join(', ')
  const parts = [morning.length ? `${list(morning)} (morning)` : '', evening.length ? `${list(evening)} (evening)` : ''].filter(Boolean)
  if (!parts.length) return null
  return (
    <More summary={`More psalms for today: ${parts.join('; ')}`}>
      {[...morning, ...evening].map((p) => (
        <Psalm key={key(p.portion)} reading={p} />
      ))}
    </More>
  )
}

function Psalm({ reading }: { reading: PsalmReading }) {
  const { portion, text } = reading
  const passage = psalmPassage(portion)
  return (
    <div className="reading">
      <h3>{psalmTitle(portion)}</h3>
      <ol className="stanzas">
        {text.stanzas.map((s) => (
          <li key={s.number} value={s.number}>
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

/** The reference of a lesson with several parts: "Genesis 19:1–3, 19:12–29". */
const lessonTitle = (parts: PassageText[]) => parts.map((p) => formatPassageId(p.passage)).join('; ')

function LessonSection({ title, morning, evening }: { title: string; morning?: LessonText; evening?: LessonText }) {
  return (
    <Section title={title}>
      {morning ? <Lesson lesson={morning} /> : <p className="note">The 1922 table has no lesson for this day in the transcription.</p>}
      {evening && (
        <More summary={`Evening: ${evening.parts.length ? lessonTitle(evening.parts) : evening.apocrypha}`}>
          <Lesson lesson={evening} />
        </More>
      )}
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
  return (
    <div className="reading">
      <h3>
        {label && <span className="label">{label}</span>}
        {formatPassageId(id)}
      </h3>
      <p className="scripture">
        {text.verses.map((v, i) => {
          const newChapter = i > 0 && v.chapter !== text.verses[i - 1].chapter
          return (
            <span key={`${v.chapter}.${v.verse}`}>
              {newChapter && <span className="chapter">Chapter {v.chapter}</span>}
              <sup>{v.verse}</sup>
              {v.text}{' '}
            </span>
          )
        })}
      </p>
      {note && <p className="note">{note}</p>}
      <p className="source">King James Version</p>
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
