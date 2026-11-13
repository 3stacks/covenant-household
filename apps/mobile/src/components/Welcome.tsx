import { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { biblesIn, LANGUAGE_NAMES, LANGUAGES, WELCOME_TEXT, type Language } from '@daily-prayer/core/bibles'
import { usePrefs } from '../lib/prefs.tsx'
import { serif, useColors } from '../lib/theme.ts'

/**
 * The first launch: choose a language, then a Bible in that language. The
 * settings screen has the same choices.
 */
export function Welcome() {
  const c = useColors()
  const [prefs, update] = usePrefs()
  const [language, setLanguage] = useState<Language>()
  const [bible, setBible] = useState(prefs.bible)

  if (!language) {
    return (
      <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={st.page}>
        <Image source={require('../../assets/icon.png')} style={st.icon} accessibilityIgnoresInvertColors />
        <Text style={[st.title, { color: c.ink }]} accessibilityRole="header">
          Covenant Household
        </Text>
        <Text style={[st.muted, { color: c.muted }]}>A Reformed daily prayer book for family worship.</Text>
        <Text style={[st.question, { color: c.ink }]}>Choose your language</Text>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            accessibilityRole="button"
            accessibilityLanguage={lang}
            onPress={() => {
              setLanguage(lang)
              setBible(biblesIn(lang).some((b) => b.id === prefs.bible) ? prefs.bible : biblesIn(lang)[0].id)
            }}
            style={[st.choice, { borderColor: c.line, backgroundColor: c.card }]}>
            <Text style={[st.choiceText, { color: c.ink }]}>{LANGUAGE_NAMES[lang]}</Text>
          </Pressable>
        ))}
      </ScrollView>
    )
  }

  const text = WELCOME_TEXT[language]
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={st.page}>
      <Text style={[st.title, { color: c.ink }]} accessibilityRole="header">
        {text.chooseBible}
      </Text>
      {text.note && <Text style={[st.muted, { color: c.muted }]}>{text.note}</Text>}
      <View style={st.list}>
        {biblesIn(language).map((b) => {
          const selected = bible === b.id
          return (
            <Pressable
              key={b.id}
              onPress={() => setBible(b.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[st.option, { borderColor: selected ? c.accent : c.line, backgroundColor: c.card }]}>
              <Text style={[st.label, { color: c.ink }]}>
                {b.name} ({b.abbr})
              </Text>
              <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20 }}>{b.blurb}</Text>
            </Pressable>
          )
        })}
      </View>
      <Pressable onPress={() => update({ bible, onboarded: true })} accessibilityRole="button" style={[st.start, { backgroundColor: c.accent }]}>
        <Text style={[st.choiceText, { color: c.bg }]}>{text.start}</Text>
      </Pressable>
      <Pressable onPress={() => setLanguage(undefined)} accessibilityRole="button" hitSlop={8} style={st.back}>
        <Text style={{ color: c.accent, fontSize: 15 }}>‹ {text.back}</Text>
      </Pressable>
    </ScrollView>
  )
}

const st = StyleSheet.create({
  page: { padding: 24, paddingTop: 72, maxWidth: 480, width: '100%', alignSelf: 'center' },
  icon: { width: 72, height: 72, borderRadius: 16, alignSelf: 'center' },
  title: { fontFamily: serif.semibold, fontSize: 28, lineHeight: 34, textAlign: 'center', marginTop: 12 },
  muted: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 6 },
  question: { fontSize: 17, fontWeight: '600', textAlign: 'center', marginTop: 32, marginBottom: 12 },
  choice: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  choiceText: { fontSize: 17, fontWeight: '600' },
  list: { marginTop: 20, gap: 10 },
  option: { borderWidth: 2, borderRadius: 12, padding: 14 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  start: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  back: { alignSelf: 'center', marginTop: 16 },
})
