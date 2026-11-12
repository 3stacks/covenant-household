import { StyleSheet, Switch, Text, View } from 'react-native'
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
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  text: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
})
