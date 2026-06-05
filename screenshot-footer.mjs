import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox','--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 })
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 })
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await new Promise(r => setTimeout(r, 1000))
const totalHeight = await page.evaluate(() => document.body.scrollHeight)
await page.screenshot({
  path: 'temporary screenshots/screenshot-19-footer-zoom.png',
  clip: { x: 0, y: totalHeight - 700, width: 1440, height: 700 },
})
await browser.close()
console.log('Done')
