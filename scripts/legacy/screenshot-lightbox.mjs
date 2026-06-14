import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const dir = './temporary screenshots'
fs.mkdirSync(dir, { recursive: true })

const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'))
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? '0')).filter(n => !isNaN(n))
const next = nums.length ? Math.max(...nums) + 1 : 1

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 })
await page.goto('http://localhost:3000/portfolio', { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise(r => setTimeout(r, 1000))

// Клик по первой карточке
await page.click('button.group')
await new Promise(r => setTimeout(r, 700))

const out1 = path.join(dir, `screenshot-${next}-lightbox-open.png`)
await page.screenshot({ path: out1 })
console.log(out1)

// Клик «следующее»
const buttons = await page.$$('button[aria-label]')
for (const btn of buttons) {
  const label = await btn.evaluate(el => el.getAttribute('aria-label'))
  if (label === 'Следующее фото') {
    await btn.click()
    break
  }
}
await new Promise(r => setTimeout(r, 500))

const out2 = path.join(dir, `screenshot-${next+1}-lightbox-next.png`)
await page.screenshot({ path: out2 })
console.log(out2)

await browser.close()
