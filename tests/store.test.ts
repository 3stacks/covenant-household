import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { APP_STORE_ID, APP_STORE_URL, GOOGLE_PLAY_URL } from '../packages/core/src/links.ts'

describe('the App Store', () => {
  it('is the store page of Covenant Household', () => {
    expect(APP_STORE_ID).toBe('6834362234')
    expect(APP_STORE_URL).toBe('https://apps.apple.com/app/id6834362234')
    // The app is not on Google Play yet.
    expect(GOOGLE_PLAY_URL).toBe('')
  })

  it('has a Smart App Banner in the web app (apps/web/index.html) with the same id', () => {
    const html = readFileSync(new URL('../apps/web/index.html', import.meta.url), 'utf8')
    expect(html).toContain(`<meta name="apple-itunes-app" content="app-id=${APP_STORE_ID}" />`)
  })
})
