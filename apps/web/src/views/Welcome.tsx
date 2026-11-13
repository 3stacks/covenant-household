import { useState } from 'react'
import { biblesIn, LANGUAGE_NAMES, LANGUAGES, WELCOME_TEXT, type Language } from '@daily-prayer/core/bibles'
import type { Prefs } from '@daily-prayer/core/prefs'

/**
 * The first visit: choose a language, then a Bible in that language. The
 * settings page has the same choices.
 */
export function Welcome({ prefs, update }: { prefs: Prefs; update: (change: Partial<Prefs>) => void }) {
  const [language, setLanguage] = useState<Language>()
  const [bible, setBible] = useState(prefs.bible)

  if (!language) {
    return (
      <article className="welcome">
        <img src="icon.svg" alt="" width={72} height={72} />
        <h1>Covenant Household</h1>
        <p className="muted">A Reformed daily prayer book for family worship.</p>
        <h2>Choose your language</h2>
        <div className="choices">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              lang={lang}
              onClick={() => {
                setLanguage(lang)
                setBible(biblesIn(lang).some((b) => b.id === prefs.bible) ? prefs.bible : biblesIn(lang)[0].id)
              }}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
      </article>
    )
  }

  const text = WELCOME_TEXT[language]
  return (
    <article className="welcome" lang={language}>
      <h1>{text.chooseBible}</h1>
      {text.note && <p className="muted">{text.note}</p>}
      <div className="bible-choices">
        {biblesIn(language).map((b) => (
          <label key={b.id} className="option">
            <input type="radio" name="bible" checked={bible === b.id} onChange={() => setBible(b.id)} />
            <span>
              <strong>
                {b.name} ({b.abbr})
              </strong>
              <span className="muted">{b.blurb}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="button" className="start" onClick={() => update({ bible, onboarded: true })}>
        {text.start}
      </button>
      <button type="button" className="back" onClick={() => setLanguage(undefined)}>
        ‹ {text.back}
      </button>
    </article>
  )
}
