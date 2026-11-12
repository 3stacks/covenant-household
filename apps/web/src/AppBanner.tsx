import { useState } from 'react'
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@daily-prayer/core/links'

const DISMISSED_KEY = 'covenant-household:app-banner-dismissed'

/** The store of this phone, if the app is in that store. */
function storeUrl(): string | undefined {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return GOOGLE_PLAY_URL || undefined
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return APP_STORE_URL || undefined
  return undefined
}

function dismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * A bar that offers the app from the store, on a phone. It does not show when
 * the web app runs as an installed app, or after the reader closes it.
 */
export function AppBanner() {
  const [url] = useState(() => {
    if (matchMedia('(display-mode: standalone)').matches || dismissed()) return undefined
    return storeUrl()
  })
  const [open, setOpen] = useState(true)
  if (!url || !open) return null
  const close = () => {
    setOpen(false)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // Private mode: the bar shows again next time.
    }
  }
  return (
    <aside className="app-banner" aria-label="Get the app">
      <img src="icon.svg" alt="" width={36} height={36} />
      <span>
        <strong>Covenant Household</strong>
        <br />
        The free app for your phone.
      </span>
      <a href={url} className="app-banner-get" data-event="Get the app">
        Get
      </a>
      <button type="button" onClick={close} aria-label="Close">
        ×
      </button>
    </aside>
  )
}
