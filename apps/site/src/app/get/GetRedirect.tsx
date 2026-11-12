'use client'

import { useEffect } from 'react'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { StoreButtons, detectPlatform } from '@/components/StoreButtons'
import { APP_STORE_URL, APP_URL, GOOGLE_PLAY_URL } from '@/lib/site'

export function GetRedirect() {
  useEffect(() => {
    const platform = detectPlatform()
    const store = platform === 'ios' ? APP_STORE_URL : platform === 'android' ? GOOGLE_PLAY_URL : ''
    if (store) window.location.replace(store)
  }, [])

  return (
    <Container className="flex flex-auto flex-col items-center justify-center py-16 text-center sm:py-20 lg:py-32">
      <h1 className="font-display text-5xl font-extrabold text-stone-900 sm:text-6xl">Get Covenant Household</h1>
      <p className="mt-4 text-lg tracking-tight text-stone-700">
        Install the app on your phone, or open it in your browser.
      </p>
      <StoreButtons className="mt-8 justify-center" />
      <Button href={APP_URL} variant="outline" color="blue" className="mt-8" data-event="Open app" data-event-label="get">
        Open the web app
      </Button>
    </Container>
  )
}
