import { describe, expect, it } from 'vitest'
import { APPS, appLink, siblingOf } from '../apps/mobile/src/lib/appLink.ts'

describe('appLink', () => {
  it('opens a passage or a unit in Hearers', () => {
    expect(appLink('https://hearers.app/app/#/add/Ps.23', 'x')).toBe('hearers://add/Ps.23')
    expect(appLink('https://hearers.app/app/#/add/Ps.119.17-24', 'x')).toBe('hearers://add/Ps.119.17-24')
    expect(appLink('https://hearers.app/app/#/unit/wlc/wlc-149', 'x')).toBe('hearers://unit/wlc/wlc-149')
    expect(appLink('https://hearers.app', 'x')).toBe('hearers://')
    expect(appLink('https://hearers.app/app/', 'x')).toBe('hearers://')
  })

  it('opens a psalm in Precentor, with the tune, from a path or a hash route', () => {
    expect(appLink('https://precentor.app/psalm/023', 'x')).toBe('precentor://psalm/023')
    expect(appLink('https://precentor.app/psalm/023?tune=dundee', 'x')).toBe('precentor://psalm/023?tune=dundee')
    expect(appLink('https://precentor.app/#/psalm/023b', 'x')).toBe('precentor://psalm/023b')
    expect(appLink('https://precentor.app/#/psalm/023?tune=dundee', 'x')).toBe('precentor://psalm/023?tune=dundee')
  })

  it('opens a chapter in Haddington Bible, at the verse', () => {
    expect(appLink('https://haddingtonbible.org/psalms-23#v23-1', 'x')).toBe('haddingtonbible://psalms-23#v23-1')
    expect(appLink('https://haddingtonbible.org/1-samuel-3', 'x')).toBe('haddingtonbible://1-samuel-3')
    expect(appLink('https://haddingtonbible.org', 'x')).toBe('haddingtonbible://')
  })

  it('opens Covenant Household at the start', () => {
    expect(appLink('https://covenanthousehold.app', 'x')).toBe('covenanthousehold://')
    expect(appLink('https://covenanthousehold.app/', 'x')).toBe('covenanthousehold://')
  })

  it('keeps other pages, other sites and the app itself on the web', () => {
    expect(appLink('https://hearers.app/privacy/', 'x')).toBeUndefined()
    expect(appLink('https://precentor.app/about', 'x')).toBeUndefined()
    expect(appLink('https://haddingtonbible.org/privacy/', 'x')).toBeUndefined()
    expect(appLink('https://covenanthousehold.app/readings/', 'x')).toBeUndefined()
    expect(appLink('https://ko-fi.com/lukeboyle', 'x')).toBeUndefined()
    expect(appLink('https://precentor.app/psalm/023', 'precentor')).toBeUndefined()
    expect(appLink('http://hearers.app', 'x')).toBeUndefined()
  })

  it('opens A Method for Prayer at a head or a book', () => {
    expect(appLink('https://methodforprayer.app/app/head/adoration-3', 'x')).toBe('methodforprayer://head/adoration-3')
    expect(appLink('https://methodforprayer.app/pray', 'x')).toBe('methodforprayer://pray')
    expect(appLink('https://methodforprayer.app/privacy/', 'x')).toBeUndefined()
  })
})

describe('siblingOf', () => {
  it('gives the scheme of the sibling app that a link opens', () => {
    expect(siblingOf('https://hearers.app/app/#/add/Ps.23', 'covenanthousehold')).toBe('hearers')
    expect(siblingOf('https://precentor.app/psalm/023?tune=dundee', 'covenanthousehold')).toBe('precentor')
    expect(siblingOf('https://haddingtonbible.org/psalms-23#v23-1', 'covenanthousehold')).toBe('haddingtonbible')
    expect(siblingOf('https://methodforprayer.app/', 'covenanthousehold')).toBe('methodforprayer')
  })

  it('uses the same rules as appLink', () => {
    expect(siblingOf('https://covenanthousehold.app/', 'covenanthousehold')).toBeUndefined()
    expect(siblingOf('https://precentor.app/about', 'covenanthousehold')).toBeUndefined()
    expect(siblingOf('https://ko-fi.com/lukeboyle', 'covenanthousehold')).toBeUndefined()
    for (const url of ['https://hearers.app/', 'https://precentor.app/psalm/100', 'https://example.com/']) {
      expect(siblingOf(url, 'covenanthousehold')).toBe(appLink(url, 'covenanthousehold')?.split('://')[0])
    }
  })
})

describe('APPS', () => {
  it('gives the App Store page of each app that is on the App Store', () => {
    expect(APPS).toEqual({
      hearers: { name: 'Hearers', appStore: 'https://apps.apple.com/app/id6834307677' },
      precentor: { name: 'Precentor', appStore: 'https://apps.apple.com/app/id6834265380' },
      haddingtonbible: { name: 'Haddington Bible' },
      covenanthousehold: { name: 'Covenant Household', appStore: 'https://apps.apple.com/app/id6834362234' },
      methodforprayer: { name: 'A Method for Prayer' },
    })
  })

  it('has an entry for each app that a link can open', () => {
    for (const host of ['hearers.app', 'precentor.app', 'haddingtonbible.org', 'covenanthousehold.app', 'methodforprayer.app']) {
      const scheme = siblingOf(`https://${host}/`, 'none')
      expect(scheme && APPS[scheme], host).toBeTruthy()
    }
  })
})
