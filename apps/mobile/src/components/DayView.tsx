import { router } from 'expo-router'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native'
import { addDays, isoDate, type LoadedDay } from '@daily-prayer/core/calendar'
import { DOC_NAMES, DOC_SHORT, SIB_NOTES, unitLabel } from '@daily-prayer/core/labels'
import { learnInHearers, memoriseInHearers, psalmPassage, readInHaddington, singPsalm } from '@daily-prayer/core/links'
import { bibleById, DEFAULT_BIBLE, passageTitle, psalmHeading, PSALTERS, psalmShortLabel, type Bible } from '@daily-prayer/core/bibles'
import { calendarPath, dayPath } from '@daily-prayer/core/routes'
import type { ConfessionDoc, ConfessionUnitText, Hymn, LessonText, Paragraph, PassageText, PsalmPortion, PsalmReading, Source, Writing } from '@daily-prayer/core/types'
import { calendar } from '../lib/calendar.ts'
import { usePrefs } from '../lib/prefs.tsx'
import { SEASON_COLOURS, serif, useColors } from '../lib/theme.ts'
import { Byline, Chip, H3, Links, More, Muted, Paragraphs, Reading, Section, SourceLine, SourceName, Stanzas } from './ui.tsx'
import { Footer } from './Footer.tsx'

/** A day in one translation. The page shows "Loading" until the day is in the translation of the settings. */
type Load = { state: 'loading' } | { state: 'ready'; day: LoadedDay; bible: string } | { state: 'error'; bible: string }

/** The translation of the readings on this page. */
const BibleContext = createContext<Bible>(bibleById(DEFAULT_BIBLE)!)

/** One day. Give each date its own key, so that a new date starts from "Loading". */
export function DayView({ date }: { date: Date }) {
  const c = useColors()
  const [prefs] = usePrefs()
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
  const today = isoDate(date) === isoDate(new Date())
  const bible = bibleById(prefs.bible) ?? bibleById(DEFAULT_BIBLE)!
  const scroll = useRef<ScrollViewInstance>(null)
  const offices = useRef<{ morning?: number; evening?: number }>({})
  const jump = (y?: number) => y !== undefined && scroll.current?.scrollTo({ y: y - 8, animated: true })

  return (
    <ScrollView ref={scroll} style={{ backgroundColor: c.bg }} contentContainerStyle={st.page} contentInsetAdjustmentBehavior="automatic">
      <DateHeader date={date} today={today} churchDay={day?.church.name} season={day?.church.season} />
      {day?.holyDayName && (
        <Text style={[st.commemoration, { color: c.ink }]}>
          <Text style={[st.label, { color: c.muted }]}>{date.getDay() === 0 ? 'ALSO ' : 'HOLY DAY '}</Text>
          {day.holyDayName}
        </Text>
      )}
      {person && (
        <Text style={[st.commemoration, { color: c.ink }]}>
          <Text style={[st.label, { color: c.muted }]}>COMMEMORATION </Text>
          {person.name}
          {person.years && <Text style={{ color: c.muted }}> ({person.years})</Text>}
          {person.title && <Text style={{ color: c.muted }}>, {person.title}</Text>}
        </Text>
      )}
      {shown.state === 'loading' && <Muted style={st.empty}>Loading…</Muted>}
      {shown.state === 'error' && <Muted style={st.empty}>The readings did not load.</Muted>}
      {day && (
        <BibleContext.Provider value={bible}>
          <View style={st.offices}>
            <OfficeButton onPress={() => jump(offices.current.morning)}>Morning</OfficeButton>
            <OfficeButton onPress={() => jump(offices.current.evening)}>Evening</OfficeButton>
          </View>

          <Office title="Morning worship" onY={(y) => (offices.current.morning = y)}>
            <PsalmSection when="this morning" psalms={day.psalter.morning} />
            <LessonSection title="Old Testament" lesson={day.lessons?.morning?.first} />
            <LessonSection title="New Testament" lesson={day.lessons?.morning?.second} />
            {day.propers && (day.propers.epistle || day.propers.gospel) && (
              <Section title="Epistle and Gospel">
                <Text style={[st.propersTitle, { color: c.muted }]}>{day.propers.title.replace(/\.$/, '')}</Text>
                {day.propers.epistle && <Passage text={day.propers.epistle} label="The Epistle" />}
                {day.propers.gospel && <Passage text={day.propers.gospel} label="The Gospel" first={!day.propers.epistle} />}
              </Section>
            )}
            <PrayerSection collect={day.collect} prayer={dev?.prayer} />
          </Office>

          <Office title="Evening worship" onY={(y) => (offices.current.evening = y)}>
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

          <Text style={[st.lectionary, { color: c.muted }]}>
            Lessons: <SourceName source={day.sources.lessons} /> · Collect, Epistle and Gospel: the Book of Common Prayer
            (1662) · Psalms: the 1662 order, sung from {PSALTERS[bible.language].name} · Bible: {bible.name}
          </Text>
        </BibleContext.Provider>
      )}
      <Footer />
    </ScrollView>
  )
}

function DateHeader({ date, today, churchDay, season }: { date: Date; today: boolean; churchDay?: string; season?: keyof typeof SEASON_COLOURS }) {
  const c = useColors()
  const long = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const go = (d: Date) => router.replace(dayPath(d) as `/day/${string}`)
  return (
    <View style={st.header}>
      <Pressable onPress={() => go(addDays(date, -1))} accessibilityRole="button" accessibilityLabel="Previous day" hitSlop={12} style={st.step}>
        <Text style={[st.stepText, { color: c.accent }]}>‹</Text>
      </Pressable>
      <View style={st.headerMid}>
        <Pressable
          onPress={() => router.push(calendarPath(date) as `/calendar/${string}`)}
          accessibilityRole="button"
          accessibilityLabel="Open the calendar for this month"
          style={st.toCalendar}>
          <Text style={[st.h1, { color: c.ink }]}>{long}</Text>
          {churchDay && <Text style={[st.churchDay, { color: c.accent }]}>{churchDay}</Text>}
          <View style={[st.calHint, { borderColor: season ? SEASON_COLOURS[season] : c.line }]}>
            <Text style={{ color: c.accent, fontSize: 12 }}>Calendar</Text>
          </View>
        </Pressable>
        {!today && (
          <Pressable onPress={() => router.replace('/')} accessibilityRole="link" hitSlop={8}>
            <Text style={{ color: c.accent, fontSize: 14, marginTop: 4 }}>Go to today</Text>
          </Pressable>
        )}
      </View>
      <Pressable onPress={() => go(addDays(date, 1))} accessibilityRole="button" accessibilityLabel="Next day" hitSlop={12} style={st.step}>
        <Text style={[st.stepText, { color: c.accent }]}>›</Text>
      </Pressable>
    </View>
  )
}

const key = (p: PsalmPortion) => `${p.psalm}${p.secondVersion ? 'b' : ''}${p.verses ? `:${p.verses[0]}` : ''}`

/** Morning worship, evening worship, or the parts for the household. */
function Office({ title, children, onY }: { title: string; children: ReactNode; onY?: (y: number) => void }) {
  const c = useColors()
  return (
    <View style={st.office} onLayout={onY && ((e) => onY(e.nativeEvent.layout.y))}>
      <Text style={[st.officeTitle, { color: c.accent }]} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  )
}

function OfficeButton({ children, onPress }: { children: string; onPress: () => void }) {
  const c = useColors()
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[st.officeButton, { borderColor: c.line, backgroundColor: c.card }]}>
      <Text style={{ color: c.accent, fontWeight: '600', fontSize: 14 }}>{children}</Text>
    </Pressable>
  )
}

/** The psalms of one office in the 1662 order. Sing the first. The others are closed. */
function PsalmSection({ when, psalms }: { when: string; psalms: PsalmReading[] }) {
  const { language } = useContext(BibleContext)
  if (!psalms.length) return null
  const [first, ...rest] = psalms
  return (
    <Section title="Psalms">
      <Psalm reading={first} />
      {rest.length > 0 && (
        <More summary={`More psalms ${when}: ${rest.map((p) => psalmShortLabel(p, language)).join(', ')}`}>
          {rest.map((p, i) => (
            <Psalm key={key(p.portion)} reading={p} first={i === 0} />
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
          <H3>The Collect</H3>
          <Byline>{collect.title.replace(/\.$/, '')}</Byline>
          <Paragraphs text={collect.collects} />
          <SourceLine>The Book of Common Prayer (1662)</SourceLine>
        </>
      )}
      {prayer && (
        <Reading first={!collect?.collects}>
          {prayer.title && <H3>{prayer.title}</H3>}
          <Paragraphs text={prayer.text} />
          <SourceLine source={prayer.source} />
        </Reading>
      )}
    </Section>
  )
}

function Psalm({ reading, first = true }: { reading: PsalmReading; first?: boolean }) {
  const { portion, text } = reading
  const passage = psalmPassage(portion)
  const { language } = useContext(BibleContext)
  const psalter = PSALTERS[language]
  return (
    <Reading first={first}>
      <H3>{psalmHeading(reading, language)}</H3>
      <Stanzas stanzas={text.stanzas} />
      <SourceLine>{psalter.name}</SourceLine>
      <Links>
        {psalter.precentor && <Chip href={singPsalm(portion)}>Sing in Precentor</Chip>}
        <Chip href={readInHaddington(passage)}>{SIB_NOTES}</Chip>
        <Chip href={memoriseInHearers(passage)}>Memorise in Hearers</Chip>
      </Links>
    </Reading>
  )
}

function LessonSection({ title, lesson }: { title: string; lesson?: LessonText }) {
  return (
    <Section title={title}>
      {lesson ? <Lesson lesson={lesson} /> : <Muted>The 1922 table has no lesson for this day in the transcription.</Muted>}
    </Section>
  )
}

function Lesson({ lesson }: { lesson: LessonText }) {
  if (!lesson.parts.length) {
    return (
      <Reading>
        <H3>{lesson.apocrypha}</H3>
        <Muted>
          The 1922 table appoints this lesson from the Apocrypha. The Apocrypha is not part of the canon of Scripture (WCF
          1.3), so this app does not read it.
        </Muted>
      </Reading>
    )
  }
  return (
    <>
      {lesson.parts.map((p, i) => (
        <Passage key={p.passage} text={p} first={i === 0} />
      ))}
      {lesson.apocrypha && <Muted>In place of {lesson.apocrypha}. The 1922 table appoints that lesson from the Apocrypha.</Muted>}
    </>
  )
}

/** The verses of a passage, in one paragraph for each chapter. */
function chapters(text: PassageText) {
  const out: { chapter: number; verses: PassageText['verses'] }[] = []
  for (const v of text.verses) {
    if (out.at(-1)?.chapter !== v.chapter) out.push({ chapter: v.chapter, verses: [] })
    out.at(-1)!.verses.push(v)
  }
  return out
}

function Passage({ text, label, note, first = true }: { text: PassageText; label?: string; note?: string; first?: boolean }) {
  const c = useColors()
  const id = text.passage
  const bible = useContext(BibleContext)
  return (
    <Reading first={first}>
      <H3 label={label}>{passageTitle(id, bible.language)}</H3>
      {chapters(text).map((ch, i) => (
        <View key={ch.chapter}>
          {i > 0 && <Text style={[st.chapter, { color: c.muted }]}>CHAPTER {ch.chapter}</Text>}
          <Text style={[st.scripture, { color: c.ink }]}>
            {ch.verses.map((v) => (
              <Text key={v.verse}>
                <Text style={[st.verseNum, { color: c.muted }]}>{v.verse} </Text>
                {v.text}{' '}
              </Text>
            ))}
          </Text>
        </View>
      ))}
      {note && <Muted>{note}</Muted>}
      <SourceLine>{bible.name}</SourceLine>
      <Links>
        <Chip href={readInHaddington(id)}>{SIB_NOTES}</Chip>
        <Chip href={memoriseInHearers(id)}>Memorise in Hearers</Chip>
      </Links>
    </Reading>
  )
}

function WritingSection({ label, writing }: { label: string; writing: Writing }) {
  const c = useColors()
  return (
    <Section title={label}>
      <H3>{writing.title}</H3>
      <Byline>
        {writing.author}, <Text style={{ fontStyle: 'italic' }}>{writing.work}</Text>
        {writing.year && ` (${writing.year})`}
        {writing.topic && <Text style={{ color: c.muted }}> · {writing.topic}</Text>}
      </Byline>
      <Paragraphs text={writing.text} />
      <SourceLine source={writing.source} />
    </Section>
  )
}

function HymnSection({ hymn }: { hymn: Hymn }) {
  const details = [hymn.author, hymn.tune && `Tune: ${hymn.tune}`, hymn.metre].filter(Boolean).join(' · ')
  return (
    <Section title="Hymn">
      <H3>{hymn.title}</H3>
      {details ? <Byline>{details}</Byline> : null}
      {hymn.stanzas ? (
        <Stanzas stanzas={hymn.stanzas.map((lines, i) => ({ number: i + 1, lines }))} />
      ) : (
        hymn.hymnal && (
          <Muted>
            Sing from <Text style={{ fontStyle: 'italic' }}>{hymn.hymnal.name}</Text>, number {hymn.hymnal.number}.
          </Muted>
        )
      )}
      <SourceLine source={hymn.source} />
    </Section>
  )
}

function ConfessionSection({ doc, units }: { doc: ConfessionDoc; units: ConfessionUnitText[] }) {
  const c = useColors()
  return (
    <Section title="Confession">
      <H3>{DOC_NAMES[doc]}</H3>
      {units.map((u, i) => (
        <View key={u.id} style={i > 0 ? { marginTop: 12 } : undefined}>
          <Text style={[st.unitHead, { color: c.ink }]}>
            <Text style={{ color: c.accent }}>{unitLabel(doc, u.id)} </Text>
            {u.prompt}
          </Text>
          <Text style={[st.scripture, { color: c.ink, marginTop: 4 }]}>{u.text}</Text>
        </View>
      ))}
      <Links>
        {units.map((u) => (
          <Chip key={u.id} href={learnInHearers(doc, u.id)}>
            Learn {DOC_SHORT[doc]} {unitLabel(doc, u.id)} in Hearers
          </Chip>
        ))}
      </Links>
    </Section>
  )
}

const st = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  step: { width: 40, alignItems: 'center' },
  stepText: { fontSize: 34, lineHeight: 40 },
  headerMid: { flex: 1, alignItems: 'center' },
  toCalendar: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6 },
  h1: { fontFamily: serif.semibold, fontSize: 25, lineHeight: 31, textAlign: 'center' },
  churchDay: { fontFamily: serif.italic, fontSize: 18, lineHeight: 24, marginTop: 4, textAlign: 'center' },
  calHint: { borderWidth: 1, borderRadius: 999, paddingVertical: 1, paddingHorizontal: 10, marginTop: 6 },
  commemoration: { fontFamily: serif.regular, fontSize: 17, lineHeight: 24, textAlign: 'center', marginBottom: 12 },
  label: { fontFamily: undefined, fontSize: 11, fontWeight: '600', letterSpacing: 0.7 },
  empty: { textAlign: 'center', paddingVertical: 32 },
  propersTitle: { fontFamily: serif.italic, fontSize: 16, marginBottom: 8 },
  scripture: { fontFamily: serif.regular, fontSize: 19, lineHeight: 31 },
  verseNum: { fontFamily: undefined, fontSize: 11, fontWeight: '600' },
  chapter: { fontSize: 12, fontWeight: '600', letterSpacing: 0.7, marginTop: 10, marginBottom: 4 },
  unitHead: { fontFamily: serif.semibold, fontSize: 17, lineHeight: 24 },
  offices: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 4 },
  officeButton: { borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 16 },
  office: { marginTop: 20 },
  officeTitle: { fontFamily: serif.semibold, fontSize: 22, lineHeight: 28, marginBottom: 10 },
  lectionary: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 24 },
})
