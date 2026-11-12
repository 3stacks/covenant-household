import { PREF_OPTIONS as OPTIONS, type Prefs } from '@daily-prayer/core/prefs'

export function Settings({ prefs, update }: { prefs: Prefs; update: (change: Partial<Prefs>) => void }) {
  return (
    <article className="settings">
      <h1>Settings</h1>
      <p className="muted">These settings stay on this device.</p>
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
