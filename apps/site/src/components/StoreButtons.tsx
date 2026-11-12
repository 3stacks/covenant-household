'use client'

import clsx from 'clsx'
import { useSyncExternalStore } from 'react'

import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/site'

export type Platform = 'ios' | 'android' | 'other'

/** The platform of the visitor, from the user agent. iPadOS reports a Mac with touch. */
export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'
  return 'other'
}

const noSubscribe = () => () => {}

/** The platform in the browser. The static HTML assumes "other". */
export function usePlatform(): Platform {
  return useSyncExternalStore(noSubscribe, detectPlatform, () => 'other')
}

export const hasStores = Boolean(APP_STORE_URL || GOOGLE_PLAY_URL)

function AppStoreBadge({ className }: { className?: string }) {
  return (
    <a href={APP_STORE_URL} className={clsx('inline-block', className)} data-event="Store" data-event-label="ios">
      {/* eslint-disable-next-line @next/next/no-img-element -- the official badge, as Apple supplies it */}
      <img src="/badges/app-store.svg" alt="Download on the App Store" width={120} height={40} className="h-10 w-auto" />
    </a>
  )
}

function GooglePlayBadge({ className }: { className?: string }) {
  // The Google Play badge has clear space inside the image. The negative
  // margin lines its edge up with the App Store badge.
  return (
    <a href={GOOGLE_PLAY_URL} className={clsx('-my-[9px] -mx-[9px] inline-block', className)} data-event="Store" data-event-label="android">
      {/* eslint-disable-next-line @next/next/no-img-element -- the official badge, as Google supplies it */}
      <img src="/badges/google-play.png" alt="Get it on Google Play" width={150} height={58} className="h-[58px] w-auto" />
    </a>
  )
}

/**
 * The store badges. A phone sees the badge of its own store first. Before the
 * app is in a store, a line of text says that the apps are coming.
 */
export function StoreButtons({ className, dark = false }: { className?: string; dark?: boolean }) {
  const platform = usePlatform()
  if (!hasStores) {
    return (
      <p className={clsx('text-base tracking-tight', dark ? 'text-white/80' : 'text-stone-500', className)}>
        The iPhone and Android apps will be available soon.
      </p>
    )
  }
  const ios = APP_STORE_URL ? <AppStoreBadge key="ios" /> : null
  const android = GOOGLE_PLAY_URL ? <GooglePlayBadge key="android" /> : null
  return (
    <div className={clsx('flex flex-wrap items-center gap-4', className)}>
      {platform === 'android' ? [android, ios] : [ios, android]}
    </div>
  )
}
