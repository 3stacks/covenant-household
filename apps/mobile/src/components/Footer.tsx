import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { HADDINGTON, KOFI, PRECENTOR } from '@daily-prayer/core/links'
import { open } from '../lib/open.ts'
import { useColors } from '../lib/theme.ts'

const HEARERS = 'https://hearers.app'

/** The links at the end of each day: the pages of this app, then the other apps. */
export function Footer() {
  const c = useColors()
  const link = (label: string, go: () => void) => (
    <Text key={label} style={[st.link, { color: c.accent }]} accessibilityRole="link" onPress={go}>
      {label}
    </Text>
  )
  return (
    <View style={st.footer}>
      <View style={st.row}>
        {link('How to use', () => router.push('/how'))}
        {link('About', () => router.push('/about'))}
        {link('Settings', () => router.push('/settings'))}
      </View>
      <View style={st.row}>
        {link('Precentor', () => open(PRECENTOR))}
        {link('Hearers', () => open(HEARERS))}
        {link('Self-Interpreting Bible', () => open(HADDINGTON))}
        {link('Support on Ko-fi', () => open(KOFI))}
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  footer: { marginTop: 32, gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16, rowGap: 8 },
  link: { fontSize: 14, paddingVertical: 4 },
})
