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
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise(r => setTimeout(r, 1000))

// Прокручиваем медленно через всю секцию чтобы триггернуть lazy load
await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('h2')).find(e => e.textContent?.includes('Что можем'))
  if (el) { el.scrollIntoView({ behavior: 'instant', block: 'start' }); return true }
  return false
})
await new Promise(r => setTimeout(r, 600))

// Прокручиваем вниз по 200px с паузой чтобы все lazy images загрузились
for (let i = 0; i < 10; i++) {
  await page.evaluate(() => window.scrollBy(0, 250))
  await new Promise(r => setTimeout(r, 200))
}
await new Promise(r => setTimeout(r, 800))

// Скроллим обратно к началу секции
await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('h2')).find(e => e.textContent?.includes('Что можем'))
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
})
await new Promise(r => setTimeout(r, 400))

// Делаем высокий вьюпорт для всей секции
await page.setViewport({ width: 1440, height: 2200, deviceScaleFactor: 1 })
await new Promise(r => setTimeout(r, 400))

const out = path.join(dir, 'screenshot-' + next + '-grid-loaded.png')
await page.screenshot({ path: out })
console.log(out)
await browser.close()
