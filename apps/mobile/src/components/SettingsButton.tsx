import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { Pressable } from 'react-native'
import { useColors } from '../lib/theme.ts'

/** The gear at the right of the header. It opens Settings. */
export function SettingsButton() {
  const c = useColors()
  return (
    <Pressable
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel="Settings"
      hitSlop={12}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: 4 })}>
      <Ionicons name="settings-outline" size={22} color={c.accent} />
    </Pressable>
  )
}
