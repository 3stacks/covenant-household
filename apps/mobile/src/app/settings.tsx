import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { BIBLES, LANGUAGE_NAMES, LANGUAGES } from '@daily-prayer/core/bibles'
import { PREF_OPTIONS } from '@daily-prayer/core/prefs'
import { P, Page } from '../components/Prose.tsx'
import { usePrefs } from '../lib/prefs.tsx'
import { useColors } from '../lib/theme.ts'

export default function Settings() {
  const c = useColors()
  const [prefs, update] = usePrefs()
  return (
    <Page>
      <P muted>These settings stay on this device.</P>

      <Text style={[st.heading, { color: c.ink }]} accessibilityRole="header">
        Bible
      </Text>
      <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20 }}>
        The translation of the lessons, the Epistle, the Gospel and the proverb. The psalms and the prayers stay in English.
      </Text>
      {LANGUAGES.map((lang) => (
        <View key={lang}>
          <Text style={[st.language, { color: c.muted }]}>{LANGUAGE_NAMES[lang].toUpperCase()}</Text>
          {BIBLES.filter((b) => b.language === lang).map((b) => {
            const selected = prefs.bible === b.id
            return (
              <Pressable
                key={b.id}
                onPress={() => update({ bible: b.id })}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[st.option, { borderBottomColor: c.line }]}>
                <View style={[st.radio, { borderColor: selected ? c.accent : c.line }]}>
                  {selected && <View style={[st.dot, { backgroundColor: c.accent }]} />}
                </View>
                <View style={st.text}>
                  <Text style={[st.label, { color: c.ink }]}>
                    {b.name} ({b.abbr})
                  </Text>
                  <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20 }}>{b.blurb}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      ))}

      <Text style={[st.heading, { color: c.ink }]} accessibilityRole="header">
        Parts of the page
      </Text>
      {PREF_OPTIONS.map((o) => (
        <View key={o.key} style={[st.option, { borderBottomColor: c.line }]}>
          <View style={st.text}>
            <Text style={[st.label, { color: c.ink }]}>{o.label}</Text>
            <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20 }}>{o.hint}</Text>
          </View>
          <Switch
            value={prefs[o.key]}
            onValueChange={(v) => update({ [o.key]: v })}
            trackColor={{ true: c.accent }}
            accessibilityLabel={o.label}
          />
        </View>
      ))}
    </Page>
  )
}

const st = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 4 },
  language: { fontSize: 11, fontWeight: '600', letterSpacing: 0.7, marginTop: 14, marginBottom: 2 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
})
