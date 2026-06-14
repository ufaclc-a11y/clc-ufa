import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const dir = './temporary screenshots'
fs.mkdirSync(dir, { recursive: true })
const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'))
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? '0')).filter(n => !isNaN(n))
const next = nums.length ? Math.max(...nums) + 1 : 1

const [url, label, scrollPx] = process.argv.slice(2)

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise(r => setTimeout(r, 1000))
if (scrollPx) await page.evaluate(px => window.scrollBy(0, parseInt(px)), scrollPx)
await new Promise(r => setTimeout(r, 400))
const out = path.join(dir, 'screenshot-' + next + (label ? '-' + label : '') + '.png')
await page.screenshot({ path: out })
console.log(out)
await browser.close()
