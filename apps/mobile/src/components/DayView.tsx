import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { addDays, isoDate, type LoadedDay } from '@daily-prayer/core/calendar'
import { DOC_NAMES, DOC_SHORT, psalmLabel, psalmTitle, SIB_NOTES, unitLabel } from '@daily-prayer/core/labels'
import { learnInHearers, memoriseInHearers, psalmPassage, readInHaddington, singPsalm } from '@daily-prayer/core/links'
import { formatPassageId } from '@daily-prayer/core/passage'
import { calendarPath, dayPath } from '@daily-prayer/core/routes'
import type { ConfessionDoc, ConfessionUnitText, Hymn, LessonText, PassageText, PsalmPortion, PsalmReading, Writing } from '@daily-prayer/core/types'
import { calendar } from '../lib/calendar.ts'
import { usePrefs } from '../lib/prefs.tsx'
import { SEASON_COLOURS, serif, useColors } from '../lib/theme.ts'
import { Byline, Chip, H3, Links, More, Muted, Paragraphs, Reading, Section, SourceLine, SourceName, Stanzas } from './ui.tsx'
import { Footer } from './Footer.tsx'

type Load = { state: 'loading' } | { state: 'ready'; day: LoadedDay } | { state: 'error' }

/** One day. Give each date its own key, so that a new date starts from "Loading". */
export function DayView({ date }: { date: Date }) {
  const c = useColors()
  const [prefs] = usePrefs()
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
  const today = isoDate(date) === isoDate(new Date())

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={st.page} contentInsetAdjustmentBehavior="automatic">
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
      {load.state === 'loading' && <Muted style={st.empty}>Loading…</Muted>}
      {load.state === 'error' && <Muted style={st.empty}>The readings did not load.</Muted>}
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
              <Text style={[st.propersTitle, { color: c.muted }]}>{day.propers.title.replace(/\.$/, '')}</Text>
              {day.propers.epistle && <Passage text={day.propers.epistle} label="The Epistle" />}
              {day.propers.gospel && <Passage text={day.propers.gospel} label="The Gospel" first={!day.propers.epistle} />}
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
                  <H3>The Collect</H3>
                  <Byline>{day.collect.title.replace(/\.$/, '')}</Byline>
                  <Paragraphs text={day.collect.collects} />
                  <SourceLine>The Book of Common Prayer (1662)</SourceLine>
                </>
              )}
              {dev?.prayer && (
                <Reading first={!day.collect?.collects}>
                  {dev.prayer.title && <H3>{dev.prayer.title}</H3>}
                  <Paragraphs text={dev.prayer.text} />
                  <SourceLine source={dev.prayer.source} />
                </Reading>
              )}
            </Section>
          )}

          {dev?.confession && dev.texts.confession && <ConfessionSection doc={dev.confession.doc} units={dev.texts.confession} />}

          {person?.writing && <WritingSection label={`About ${person.name}`} writing={person.writing} />}

          <Text style={[st.lectionary, { color: c.muted }]}>
            Lessons: <SourceName source={day.sources.lessons} /> · Collect, Epistle and Gospel: the Book of Common Prayer
            (1662) · Psalms: the 1662 order, sung from the 1650 Psalter
          </Text>
        </>
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

/** The other psalms of the day in the 1662 order, closed. */
function MorePsalms({ morning, evening }: { morning: PsalmReading[]; evening: PsalmReading[] }) {
  const list = (ps: PsalmReading[]) => ps.map((p) => psalmLabel(p.portion)).join(', ')
  const parts = [morning.length ? `${list(morning)} (morning)` : '', evening.length ? `${list(evening)} (evening)` : ''].filter(Boolean)
  if (!parts.length) return null
  return (
    <More summary={`More psalms for today: ${parts.join('; ')}`}>
      {[...morning, ...evening].map((p, i) => (
        <Psalm key={key(p.portion)} reading={p} first={i === 0} />
      ))}
    </More>
  )
}

function Psalm({ reading, first = true }: { reading: PsalmReading; first?: boolean }) {
  const { portion, text } = reading
  const passage = psalmPassage(portion)
  return (
    <Reading first={first}>
      <H3>{psalmTitle(portion)}</H3>
      <Stanzas stanzas={text.stanzas} />
      <SourceLine>The Psalms of David in Metre (1650)</SourceLine>
      <Links>
        <Chip href={singPsalm(portion)}>Sing in Precentor</Chip>
        <Chip href={readInHaddington(passage)}>{SIB_NOTES}</Chip>
        <Chip href={memoriseInHearers(passage)}>Memorise in Hearers</Chip>
      </Links>
    </Reading>
  )
}

/** The reference of a lesson with several parts: "Genesis 19:1–3; 19:12–29". */
const lessonTitle = (parts: PassageText[]) => parts.map((p) => formatPassageId(p.passage)).join('; ')

function LessonSection({ title, morning, evening }: { title: string; morning?: LessonText; evening?: LessonText }) {
  return (
    <Section title={title}>
      {morning ? <Lesson lesson={morning} /> : <Muted>The 1922 table has no lesson for this day in the transcription.</Muted>}
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
  return (
    <Reading first={first}>
      <H3 label={label}>{formatPassageId(id)}</H3>
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
      <SourceLine>King James Version</SourceLine>
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
  lectionary: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 24 },
})
