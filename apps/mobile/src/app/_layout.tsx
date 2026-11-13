import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_600SemiBold,
  useFonts,
} from "@expo-google-fonts/eb-garamond";
import { Stack } from "expo-router";
import { SettingsButton } from "../components/SettingsButton.tsx";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Welcome } from "../components/Welcome.tsx";
import { PrefsProvider, usePrefs, usePrefsLoaded } from "../lib/prefs.tsx";
import { serif, useColors } from "../lib/theme.ts";

// Show the splash screen until the fonts load.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Layout() {
  const c = useColors();
  const [loaded, failed] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_600SemiBold,
  });
  useEffect(() => {
    if (loaded || failed) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, failed]);
  if (!loaded && !failed) return null;

  return (
    <PrefsProvider>
      <StatusBar style="auto" />
      <Onboarding>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: c.bg },
            headerTintColor: c.accent,
            headerTitleStyle: { fontFamily: serif.semibold, color: c.ink },
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: c.bg },
          }}
        >
          <Stack.Screen
            name="index"
            options={{ title: "Covenant Household", headerRight: () => <SettingsButton /> }}
          />
          <Stack.Screen
            name="day/[date]"
            options={{
              title: "Covenant Household",
              animation: "fade",
              headerRight: () => <SettingsButton />,
            }}
          />
          <Stack.Screen name="calendar/index" options={{ title: "Calendar" }} />
          <Stack.Screen
            name="calendar/[month]"
            options={{ title: "Calendar", animation: "fade" }}
          />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen name="about" options={{ title: "About" }} />
          <Stack.Screen name="how" options={{ title: "How to use" }} />
        </Stack>
      </Onboarding>
    </PrefsProvider>
  );
}

/** On the first launch, the welcome screen comes before every other screen, also from a link. */
function Onboarding({ children }: { children: ReactNode }) {
  const [prefs] = usePrefs();
  const loaded = usePrefsLoaded();
  if (!loaded) return null;
  return prefs.onboarded ? children : <Welcome />;
}
