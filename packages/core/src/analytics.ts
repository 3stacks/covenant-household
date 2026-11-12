// Anonymous visit counts with Umami, as on Hearers and lector.dev.
//
// ANALYTICS_LOADER goes inline in the <head> of the website. The web app
// (apps/web/index.html) has a copy, and a test makes sure that the copies are
// the same.
//
// - window.plausible(name, { props }) queues events until the tracker loads.
// - The tracker loads from /a/boot.js after the first input, so it never slows
//   the first paint. A Pages Function serves /a/ (functions/_lib/analytics.ts).
// - A click on an element with data-event="Name" sends that event. Optional
//   data-event-label adds a "label" property.
export const ANALYTICS_LOADER = `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};(function(){var loaded=false;function load(){if(loaded)return;loaded=true;var s=document.createElement("script");s.src="/a/boot.js";s.async=true;document.head.appendChild(s)}["pointerdown","keydown","scroll","touchstart"].forEach(function(e){window.addEventListener(e,load,{once:true,passive:true})});document.addEventListener("click",function(e){var el=e.target&&e.target.closest&&e.target.closest("[data-event]");if(!el)return;var props={path:location.pathname};if(el.dataset.eventLabel)props.label=el.dataset.eventLabel;window.plausible(el.dataset.event,{props:props})},true)})();`

type Props = Record<string, string | number | boolean>

/** Send an event. Never send text that the reader types, or a preference beyond its name. */
export function track(event: string, props?: Props): void {
  try {
    ;(globalThis as { plausible?: (e: string, o?: { props?: Props }) => void }).plausible?.(event, props ? { props } : undefined)
  } catch {
    // Analytics must never break the app.
  }
}
