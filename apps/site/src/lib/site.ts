import { APP_STORE_ID, APP_STORE_URL, GOOGLE_PLAY_URL, HADDINGTON, KOFI, PRECENTOR } from '@daily-prayer/core/links'

export const APP_URL = '/app/'
export const KOFI_URL = KOFI
export const PRECENTOR_URL = PRECENTOR
export const HEARERS_URL = 'https://hearers.app'
export const SIB_URL = HADDINGTON

export { APP_STORE_ID, APP_STORE_URL, GOOGLE_PLAY_URL }

export const SITE_NAME = 'Covenant Household'
export const SITE_DESCRIPTION =
  'A Reformed daily prayer book for family worship. A psalm to sing, two lessons from Scripture and the collect for each day of the church year. Free, with no account.'

/**
 * The public address of the site, for canonical URLs, the sitemap and the
 * social cards. Set NEXT_PUBLIC_SITE_URL for a release build.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covenanthousehold.app').replace(/\/+$/, '')

/** A link into the web app: "/app/#/day/2026-11-29". */
export const appDayUrl = (iso: string) => `${APP_URL}#/day/${iso}`

/** The image that a link to the site shows on social media and in chat apps. */
export const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Covenant Household: a Reformed daily prayer book for family worship',
}
