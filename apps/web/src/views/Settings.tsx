import { BIBLES, LANGUAGE_NAMES, LANGUAGES } from '@daily-prayer/core/bibles'
import { PREF_OPTIONS as OPTIONS, type Prefs } from '@daily-prayer/core/prefs'

export function Settings({ prefs, update }: { prefs: Prefs; update: (change: Partial<Prefs>) => void }) {
  return (
    <article className="settings">
      <h1>Settings</h1>
      <p className="muted">These settings stay on this device.</p>

      <fieldset className="bibles">
        <legend>Bible</legend>
        <p className="muted">The translation of the lessons, the Epistle, the Gospel and the proverb. The psalms and the prayers stay in English.</p>
        {LANGUAGES.map((lang) => (
          <div key={lang} className="bible-language" lang={lang}>
            <h2>{LANGUAGE_NAMES[lang]}</h2>
            {BIBLES.filter((b) => b.language === lang).map((b) => (
              <label key={b.id} className="option">
                <input type="radio" name="bible" checked={prefs.bible === b.id} onChange={() => update({ bible: b.id })} />
                <span>
                  <strong>
                    {b.name} ({b.abbr})
                  </strong>
                  <span className="muted">{b.blurb}</span>
                </span>
              </label>
            ))}
          </div>
        ))}
      </fieldset>

      {OPTIONS.map((o) => (
        <label key={o.key} className="option">
          <input type="checkbox" checked={prefs[o.key]} onChange={(e) => update({ [o.key]: e.target.checked })} />
          <span>
            <strong>{o.label}</strong>
            <span className="muted">{o.hint}</span>
          </span>
        </label>
      ))}
      <p>
        <a href="#/">Back to today</a>
      </p>
    </article>
  )
}
