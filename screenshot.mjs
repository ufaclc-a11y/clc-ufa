import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const url   = process.argv[2] || 'http://localhost:3000'
const label = process.argv[3] ? `-${process.argv[3]}` : ''
const dir   = './temporary screenshots'

fs.mkdirSync(dir, { recursive: true })

const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'))
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? '0')).filter(n => !isNaN(n))
const next = nums.length ? Math.max(...nums) + 1 : 1
const out  = path.join(dir, `screenshot-${next}${label}.png`)

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
})
const page    = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

// Прокручиваем страницу чтобы trigger lazy-loaded images
await page.evaluate(async () => {
  await new Promise(resolve => {
    let total = document.body.scrollHeight
    let current = 0
    const step = 600
    const timer = setInterval(() => {
      window.scrollBy(0, step)
      current += step
      if (current >= total) { clearInterval(timer); window.scrollTo(0,0); resolve() }
    }, 100)
  })
})
await new Promise(r => setTimeout(r, 1500))

const fullPage = process.argv[4] === '--full'
await page.screenshot({ path: out, fullPage })
await browser.close()

console.log(out)
