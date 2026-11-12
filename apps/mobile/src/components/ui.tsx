import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View, type TextStyle } from 'react-native'
import type { Paragraph, Source } from '@daily-prayer/core/types'
import { open } from '../lib/open.ts'
import { serif, useColors } from '../lib/theme.ts'

// The building blocks of a page. They match the classes of the web app.

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const c = useColors()
  return (
    <View style={[s.part, { backgroundColor: c.card, borderColor: c.line }]}>
      <Text style={[s.partTitle, { color: c.muted }]} accessibilityRole="header">
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  )
}

export function H3({ children, label }: { children: ReactNode; label?: string }) {
  const c = useColors()
  return (
    <Text style={[s.h3, { color: c.ink }]} accessibilityRole="header">
      {label && <Text style={[s.label, { color: c.muted }]}>{label.toUpperCase()} </Text>}
      {children}
    </Text>
  )
}

/** A reading inside a section. Readings after the first have a line above them. */
export function Reading({ children, first = true }: { children: ReactNode; first?: boolean }) {
  const c = useColors()
  return <View style={first ? undefined : [s.next, { borderTopColor: c.line }]}>{children}</View>
}

export function Muted({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const c = useColors()
  return <Text style={[s.note, { color: c.muted }, style]}>{children}</Text>
}

export function Byline({ children }: { children: ReactNode }) {
  const c = useColors()
  return <Text style={[s.byline, { color: c.muted }]}>{children}</Text>
}

export function Paragraphs({ text }: { text: Paragraph[] }) {
  const c = useColors()
  return (
    <View>
      {text.map((p, i) => (
        <Text key={i} style={[s.body, { color: c.ink }]}>
          {p}
        </Text>
      ))}
    </View>
  )
}

/** Numbered stanzas of a psalm or a hymn. */
export function Stanzas({ stanzas }: { stanzas: { number: number; lines: string[] }[] }) {
  const c = useColors()
  return (
    <View style={s.stanzas}>
      {stanzas.map((st) => (
        <View key={st.number} style={s.stanza}>
          <Text style={[s.stanzaNum, { color: c.muted }]}>{st.number}</Text>
          <View style={s.flex}>
            {st.lines.map((line, i) => (
              <Text key={i} style={[s.verseLine, { color: c.ink }]}>
                {line}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}

/** An optional reading, closed until the reader opens it. */
export function More({ summary, children }: { summary: string; children: ReactNode }) {
  const c = useColors()
  const [opened, setOpened] = useState(false)
  return (
    <View style={[s.more, { borderTopColor: c.line }]}>
      <Pressable onPress={() => setOpened(!opened)} accessibilityRole="button" accessibilityState={{ expanded: opened }} hitSlop={8}>
        <Text style={[s.summary, { color: c.accent }]}>
          {opened ? '▾' : '▸'} {summary}
        </Text>
      </Pressable>
      {opened && <View style={s.moreBody}>{children}</View>}
    </View>
  )
}

/** The links to the other apps, as a row of chips. */
export function Links({ children }: { children: ReactNode }) {
  return <View style={s.links}>{children}</View>
}

export function Chip({ href, children }: { href?: string; children: ReactNode }) {
  const c = useColors()
  if (!href) return null
  return (
    <Pressable onPress={() => open(href)} accessibilityRole="link" style={[s.chip, { backgroundColor: c.accentSoft }]}>
      <Text style={[s.chipText, { color: c.accent }]}>{children}</Text>
    </Pressable>
  )
}

export function SourceName({ source }: { source: Source }) {
  const c = useColors()
  return (
    <>
      {source.licence === 'sample' && <Text style={{ color: c.sample, fontWeight: '600' }}>Sample </Text>}
      {source.url ? (
        <Text style={{ color: c.accent }} accessibilityRole="link" onPress={() => open(source.url!)}>
          {source.name}
        </Text>
      ) : (
        source.name
      )}
    </>
  )
}

export function SourceLine({ source, children }: { source?: Source; children?: ReactNode }) {
  const c = useColors()
  return <Text style={[s.source, { color: c.muted }]}>{source ? <SourceName source={source} /> : children}</Text>
}

export const s = StyleSheet.create({
  flex: { flex: 1 },
  part: { borderWidth: 1, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, marginVertical: 6 },
  partTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  h3: { fontFamily: serif.semibold, fontSize: 20, lineHeight: 26, marginBottom: 4 },
  label: { fontFamily: undefined, fontSize: 11, fontWeight: '600', letterSpacing: 0.7 },
  next: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderStyle: 'dashed' },
  note: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  byline: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  body: { fontFamily: serif.regular, fontSize: 19, lineHeight: 30, marginBottom: 10 },
  stanzas: { marginTop: 4 },
  stanza: { flexDirection: 'row', marginBottom: 10 },
  stanzaNum: { width: 22, fontSize: 13, lineHeight: 27 },
  verseLine: { fontFamily: serif.regular, fontSize: 18, lineHeight: 27 },
  more: { marginTop: 14, borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 10 },
  summary: { fontSize: 15, lineHeight: 21 },
  moreBody: { marginTop: 8 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  chip: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 },
  chipText: { fontSize: 14 },
  source: { fontSize: 13, marginTop: 10 },
})
