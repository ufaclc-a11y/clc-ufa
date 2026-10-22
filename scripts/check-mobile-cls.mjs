import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import puppeteer from 'puppeteer'

// Run against a local production server, never submit forms or accept analytics.
// Example: PUPPETEER_EXECUTABLE_PATH=/path/to/chrome node scripts/check-mobile-cls.mjs
const base = process.env.CLS_BASE_URL || 'http://localhost:3000'
const width = Number(process.env.CLS_WIDTH || 390)
const routes = process.argv.slice(2)
if (!routes.length) routes.push('/', '/services/lazernaya-rezka', '/products/trafarety', '/blog/adresnik-dlya-sobaki-chto-vybrat')
const screenshotDir = process.env.CLS_SCREENSHOT_DIR
if (screenshotDir && !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) {
  throw new Error('Screenshots are restricted to localhost')
}
if (screenshotDir) await fs.mkdir(screenshotDir, { recursive: true })
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const results = []
try {
  for (const route of routes) {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    await page.setViewport({ width, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
    const cdp = await page.createCDPSession()
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await page.setRequestInterception(true)
    page.on('request', request => {
      const url = request.url()
      if (!url.startsWith(base + '/') && !url.startsWith('data:')) {
        void request.abort().catch(() => {})
      } else if (request.resourceType() === 'font') {
        // Force a visible fallback-font phase on cold loads.
        setTimeout(() => { void request.continue().catch(() => {}) }, 2000)
      } else {
        void request.continue().catch(() => {})
      }
    })
    await page.evaluateOnNewDocument(() => {
      window.__clsEntries = []
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          window.__clsEntries.push({
            value: entry.value, time: entry.startTime, recentInput: entry.hadRecentInput,
            sources: (entry.sources || []).map(source => ({
              node: (source.node?.nodeType === Node.TEXT_NODE ? source.node.parentElement : source.node)?.outerHTML?.slice(0, 400),
              before: source.previousRect.toJSON(), after: source.currentRect.toJSON(),
            })),
          })
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const response = await page.goto(base + route, { waitUntil: 'networkidle0', timeout: 60000 })
    assert.equal(response?.status(), 200, route)
    await new Promise(resolve => setTimeout(resolve, 1500))
    if (screenshotDir) {
      const name = route === '/' ? 'home' : route.replaceAll('/', '_')
      await page.screenshot({ path: `${screenshotDir}/${width}-${name}.png` })
    }
    for (let step = 0; step < 4; step++) {
      await page.evaluate(() => scrollBy(0, 600))
      await new Promise(resolve => setTimeout(resolve, 650))
    }
    const measurement = await page.evaluate(() => ({
      entries: window.__clsEntries,
      overflow: document.documentElement.scrollWidth > innerWidth,
      font: getComputedStyle(document.body).fontFamily,
    }))
    let cls = 0, session = 0, first = 0, last = 0
    for (const entry of measurement.entries.filter(entry => !entry.recentInput)) {
      if (entry.time - last < 1000 && entry.time - first < 5000) session += entry.value
      else { session = entry.value; first = entry.time }
      last = entry.time
      cls = Math.max(cls, session)
    }
    const result = { route, width, cls, ...measurement, errors }
    results.push(result)
    console.log(JSON.stringify(result))
    await context.close()
  }
} finally {
  await browser.close()
}
if (process.env.CLS_REPORT) await fs.writeFile(process.env.CLS_REPORT, JSON.stringify({
  base, conditions: 'CPU 4x, cold contexts, fonts delayed 2s, first-party requests only, four scroll steps; maximum CLS session window', results,
}, null, 2))
for (const result of results) {
  assert.ok(result.cls <= 0.1, `${result.route}: mobile CLS ${result.cls} exceeds 0.1`)
  assert.equal(result.overflow, false, `${result.route}: horizontal overflow`)
  assert.deepEqual(result.errors, [], `${result.route}: browser errors`)
}
