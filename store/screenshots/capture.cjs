// Capture the raw Covenant Household screens from the web export of the mobile app, at the size of an iPhone.
// The capture hides the Ko-fi link, because the iOS app does not show it.
// node capture.cjs <outDir> [baseUrl]
const { chromium } = require('playwright')
const OUT = process.argv[2]
const B = process.argv[3] ?? 'http://localhost:18186'
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, serviceWorkers: 'block' })
  const p = await ctx.newPage()
  const shot = async (n) => {
    await p.addStyleTag({ content: 'a[href*="ko-fi"]{display:none!important}' })
    // The Ko-fi link of the footer is a button, so hide it by its text too.
    await p.evaluate(() => {
      for (const el of document.querySelectorAll('div, a, span')) if (el.textContent?.trim() === 'Support on Ko-fi') el.style.display = 'none'
    })
    await p.waitForTimeout(900)
    await p.screenshot({ path: `${OUT}/${n}.png` })
    console.log(n)
  }
  const top = async (re, nudge = 0) => {
    const el = p.getByText(re).first()
    await el.evaluate((n) => n.scrollIntoView({ block: 'start' }))
    if (nudge) await p.mouse.wheel(0, nudge)
  }
  await p.goto(B + '/', { waitUntil: 'networkidle' })
  await p.getByText('English', { exact: true }).click()
  await p.waitForTimeout(500)
  await shot('bible')
  await p.getByText('Start', { exact: true }).click()
  await p.waitForTimeout(1500)
  await shot('today')
  await top(/^For the household$/)
  await shot('household')
  await p.goto(B + '/calendar', { waitUntil: 'networkidle' })
  await shot('calendar')
  await b.close()
})().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
