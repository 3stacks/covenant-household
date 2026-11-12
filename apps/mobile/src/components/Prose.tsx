import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { open } from '../lib/open.ts'
import { serif, useColors } from '../lib/theme.ts'

// Text pages: How to use, About and Settings.

export function Page({ children }: { children: ReactNode }) {
  const c = useColors()
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={st.page} contentInsetAdjustmentBehavior="automatic">
      {children}
    </ScrollView>
  )
}

export function H2({ children }: { children: ReactNode }) {
  const c = useColors()
  return (
    <Text style={[st.h2, { color: c.ink }]} accessibilityRole="header">
      {children}
    </Text>
  )
}

export function P({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const c = useColors()
  return <Text style={[st.p, { color: muted ? c.muted : c.ink }]}>{children}</Text>
}

/** A list item. Give a number for an ordered list. */
export function Li({ children, n }: { children: ReactNode; n?: number }) {
  const c = useColors()
  return (
    <View style={st.li}>
      <Text style={[st.p, st.bullet, { color: c.muted }]}>{n ? `${n}.` : '•'}</Text>
      <Text style={[st.p, st.flex, { color: c.ink }]}>{children}</Text>
    </View>
  )
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const c = useColors()
  return (
    <Text style={{ color: c.accent }} accessibilityRole="link" onPress={() => open(href)}>
      {children}
    </Text>
  )
}

export function B({ children }: { children: ReactNode }) {
  return <Text style={{ fontWeight: '600' }}>{children}</Text>
}

const st = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  h2: { fontFamily: serif.semibold, fontSize: 21, lineHeight: 27, marginTop: 24, marginBottom: 6 },
  p: { fontSize: 16, lineHeight: 24, marginBottom: 10 },
  li: { flexDirection: 'row', paddingLeft: 4 },
  bullet: { width: 22 },
  flex: { flex: 1 },
})
