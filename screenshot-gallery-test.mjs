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

// Test 1: services/uf-pechat — прокрутка до галереи
await page.goto('http://localhost:3000/services/uf-pechat', { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise(r => setTimeout(r, 1000))
await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('h2'))
  const h2 = els.find(el => el.textContent && el.textContent.includes('Примеры'))
  if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' })
})
await new Promise(r => setTimeout(r, 400))
const out1 = path.join(dir, 'screenshot-' + next + '-svc-gallery.png')
await page.screenshot({ path: out1 })
console.log('SAVED:' + out1)

// Test 2: services — клик → лайтбокс
const svcBtns = await page.$$('button[aria-label^="Открыть фото"]')
console.log('Service btn count:', svcBtns.length)
if (svcBtns.length > 0) {
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label^="Открыть фото"]')
    if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await new Promise(r => setTimeout(r, 500))
  await svcBtns[0].evaluate(el => el.click())
  await new Promise(r => setTimeout(r, 800))
  const hasLightbox = await page.evaluate(() => !!document.querySelector('[role="dialog"]'))
  console.log('Has lightbox (services):', hasLightbox)
  const out2 = path.join(dir, 'screenshot-' + (next + 1) + '-svc-lightbox.png')
  await page.screenshot({ path: out2 })
  console.log('SAVED:' + out2)
} else {
  console.log('NO GALLERY BUTTONS FOUND on services page')
}

// Test 3: about — прокрутка до галереи
await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise(r => setTimeout(r, 1000))
await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('h2'))
  const h2 = els.find(el => el.textContent && el.textContent.includes('Что мы делаем'))
  if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' })
})
await new Promise(r => setTimeout(r, 400))
const out3 = path.join(dir, 'screenshot-' + (next + 2) + '-about-gallery.png')
await page.screenshot({ path: out3 })
console.log('SAVED:' + out3)

// Test 4: about — через ElementHandle
const aboutBtns = await page.$$('button[aria-label^="Открыть фото"]')
console.log('About btn count:', aboutBtns.length)
if (aboutBtns.length > 0) {
  // Прокрутка через evaluate
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label^="Открыть фото"]')
    if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await new Promise(r => setTimeout(r, 500))
  // Прямой вызов click() через element handle
  await aboutBtns[0].evaluate(el => el.click())
  await new Promise(r => setTimeout(r, 1000))
  const hasLightbox = await page.evaluate(() => !!document.querySelector('[role="dialog"]'))
  console.log('Has lightbox (about):', hasLightbox)
  const out4 = path.join(dir, 'screenshot-' + (next + 3) + '-about-lightbox.png')
  await page.screenshot({ path: out4 })
  console.log('SAVED:' + out4)
} else {
  console.log('NO GALLERY BUTTONS FOUND on about page')
}

await browser.close()
