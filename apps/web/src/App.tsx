import { KOFI } from '@daily-prayer/core/links'
import { AppBanner } from './AppBanner.tsx'
import { usePrefs } from './lib/prefs.ts'
import { useRoute } from './router.ts'
import { About } from './views/About.tsx'
import { CalendarView } from './views/CalendarView.tsx'
import { DayView } from './views/DayView.tsx'
import { HowToUse } from './views/HowToUse.tsx'
import { Settings } from './views/Settings.tsx'
import { Welcome } from './views/Welcome.tsx'

export function App() {
  const route = useRoute()
  const [prefs, update] = usePrefs()
  return (
    <div className="app">
      <AppBanner />
      <nav className="top">
        <a href="#/" className="brand">
          Covenant Household
        </a>
        <span className="nav-links">
          <a href="#/how">How to use</a>
          <a href="#/about">About</a>
          <a href="#/settings">Settings</a>
        </span>
      </nav>
      <main>
        {!prefs.onboarded ? (
          <Welcome prefs={prefs} update={update} />
        ) : route.view === 'settings' ? (
          <Settings prefs={prefs} update={update} />
        ) : route.view === 'about' ? (
          <About />
        ) : route.view === 'how' ? (
          <HowToUse />
        ) : route.view === 'calendar' ? (
          <CalendarView year={route.year} month={route.month} />
        ) : (
          <DayView key={route.date.toDateString()} date={route.date} today={route.today} prefs={prefs} />
        )}
      </main>
      <footer>
        <a href="https://precentor.app" target="_blank" rel="noopener">
          Precentor
        </a>
        <a href="https://hearers.app" target="_blank" rel="noopener">
          Hearers
        </a>
        <a href="https://haddingtonbible.org" target="_blank" rel="noopener">
          Self-Interpreting Bible
        </a>
        <a href={KOFI} target="_blank" rel="noopener" data-event="Ko-fi">
          Support on Ko-fi
        </a>
      </footer>
    </div>
  )
}
