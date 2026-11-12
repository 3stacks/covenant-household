import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ScrollViewInstance } from 'react-native'
import { addDays, dateKey, isoDate } from '@daily-prayer/core/calendar'
import { churchDay, HOLY_DAYS, type Season } from '@daily-prayer/core/churchYear'
import { feastName, SEASON_NAMES } from '@daily-prayer/core/labels'
import { calendarPath, dayPath } from '@daily-prayer/core/routes'
import type { Commemoration } from '@daily-prayer/core/types'
import { calendar } from '../lib/calendar.ts'
import { SEASON_COLOURS, serif, useColors } from '../lib/theme.ts'

interface Week {
  /** The name of the Sunday, or of the first day when the month starts mid-week. */
  title: string
  season: Season
  days: Date[]
}

/** The days of a month, in weeks that start on Sunday. */
function weeksOf(year: number, month: number): Week[] {
  const weeks: Week[] = []
  for (let d = new Date(year, month, 1); d.getMonth() === month; d = addDays(d, 1)) {
    if (d.getDay() === 0 || weeks.length === 0) {
      // Name the week after its Sunday, also when the month starts mid-week.
      const c = churchDay(addDays(d, -d.getDay()))
      weeks.push({ title: c.name, season: c.season, days: [] })
    }
    weeks[weeks.length - 1].days.push(d)
  }
  return weeks
}

export function CalendarView({ year, month }: { year: number; month: number }) {
  const c = useColors()
  const { height } = useWindowDimensions()
  const [people, setPeople] = useState<Record<string, Commemoration>>({})
  useEffect(() => {
    let live = true
    calendar.loadCommemorations(month).then(
      (list) => live && setPeople(list),
      () => {
        // The calendar works with no commemorations.
      },
    )
    return () => {
      live = false
    }
  }, [month])

  // Scroll to today when the month contains it. The row gives its position in
  // the week, and the week gives its position in the page.
  const scroll = useRef<ScrollViewInstance>(null)
  const weekTop = useRef<Record<number, number>>({})
  const todayRow = useRef<{ week: number; y: number }>(undefined)
  const scrolled = useRef(false)
  const today = isoDate(new Date())
  // The two layouts can come in either order, so each one tries.
  const toToday = async () => {
    const row = todayRow.current
    const top = row && weekTop.current[row.week]
    if (scrolled.current || !row || top === undefined) return
    scrolled.current = true
    const still = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false)
    scroll.current?.scrollTo({ y: Math.max(0, top + row.y - height / 3), animated: !still })
  }

  const first = new Date(year, month, 1)
  const title = first.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
  const go = (d: Date) => router.replace(calendarPath(d) as `/calendar/${string}`)

  return (
    <ScrollView ref={scroll} style={{ backgroundColor: c.bg }} contentContainerStyle={st.page} contentInsetAdjustmentBehavior="automatic">
      <View style={st.header}>
        <Pressable onPress={() => go(new Date(year, month - 1, 1))} accessibilityRole="button" accessibilityLabel="Previous month" hitSlop={12} style={st.step}>
          <Text style={[st.stepText, { color: c.accent }]}>‹</Text>
        </Pressable>
        <View style={st.mid}>
          <Text style={[st.h1, { color: c.ink }]}>{title}</Text>
          <Text style={{ color: c.accent, fontSize: 14 }} accessibilityRole="link" onPress={() => router.dismissTo('/')}>
            Go to today
          </Text>
        </View>
        <Pressable onPress={() => go(new Date(year, month + 1, 1))} accessibilityRole="button" accessibilityLabel="Next month" hitSlop={12} style={st.step}>
          <Text style={[st.stepText, { color: c.accent }]}>›</Text>
        </Pressable>
      </View>

      {weeksOf(year, month).map((week, w) => (
        <View
          key={isoDate(week.days[0])}
          onLayout={(e) => {
            weekTop.current[w] = e.nativeEvent.layout.y
            toToday()
          }}
          style={[st.week, { backgroundColor: c.card, borderColor: c.line, borderLeftColor: SEASON_COLOURS[week.season] }]}>
          <View style={st.weekHead}>
            <Text style={[st.season, { color: c.muted }]}>{SEASON_NAMES[week.season].toUpperCase()}</Text>
            <Text style={[st.weekTitle, { color: c.ink }]} accessibilityRole="header">
              {week.title}
            </Text>
          </View>
          {week.days.map((d) => {
            const cd = churchDay(d)
            const holy = cd.holyDay ? HOLY_DAYS[cd.holyDay.replace(/^holy-/, '')] : undefined
            const person = people[dateKey(d)]
            const isToday = isoDate(d) === today
            // The week heading names the Sunday, so its row shows only a saint's day or a person.
            const feast = feastName(d, cd.name)
            return (
              <Pressable
                key={isoDate(d)}
                onLayout={
                  isToday
                    ? (e) => {
                        todayRow.current = { week: w, y: e.nativeEvent.layout.y }
                        toToday()
                      }
                    : undefined
                }
                onPress={() => router.push(dayPath(d) as `/day/${string}`)}
                accessibilityRole="link"
                style={({ pressed }) => [st.row, { borderTopColor: c.line }, (isToday || pressed) && { backgroundColor: c.accentSoft }]}>
                <View style={st.num}>
                  <Text style={[st.date, { color: isToday ? c.accent : c.ink }]}>{d.getDate()}</Text>
                  <Text style={{ color: c.muted, fontSize: 12 }}>{d.toLocaleDateString('en-AU', { weekday: 'short' })}</Text>
                </View>
                <View style={st.what}>
                  {feast && <Text style={[st.name, { color: c.ink }]}>{feast}</Text>}
                  {holy && <Text style={{ color: c.accent, fontSize: 15 }}>{holy}</Text>}
                  {person && <Text style={{ color: c.muted, fontSize: 15 }}>{person.name}</Text>}
                </View>
              </Pressable>
            )
          })}
        </View>
      ))}
    </ScrollView>
  )
}

const st = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  step: { width: 40, alignItems: 'center' },
  stepText: { fontSize: 34, lineHeight: 40 },
  mid: { flex: 1, alignItems: 'center' },
  h1: { fontFamily: serif.semibold, fontSize: 25, lineHeight: 31 },
  week: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 12, marginVertical: 6, overflow: 'hidden' },
  weekHead: { paddingTop: 12, paddingBottom: 8, paddingHorizontal: 14 },
  season: { fontSize: 11, fontWeight: '600', letterSpacing: 0.9, marginBottom: 2 },
  weekTitle: { fontFamily: serif.semibold, fontSize: 18, lineHeight: 23 },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 9, paddingHorizontal: 14, borderTopWidth: 1, minHeight: 44 },
  num: { width: 56, flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  date: { fontWeight: '700', fontSize: 16 },
  what: { flex: 1 },
  name: { fontFamily: serif.regular, fontSize: 17 },
})
