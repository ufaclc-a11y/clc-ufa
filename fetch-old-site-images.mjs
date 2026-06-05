import puppeteer from 'puppeteer'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { URL } from 'url'

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('https://clc-ufa.ru', { waitUntil: 'networkidle2', timeout: 30000 })

// Scroll to load lazy images
await page.evaluate(async () => {
  await new Promise(resolve => {
    let current = 0
    const step = 500
    const timer = setInterval(() => {
      window.scrollBy(0, step)
      current += step
      if (current >= document.body.scrollHeight) { clearInterval(timer); resolve() }
    }, 120)
  })
})
await new Promise(r => setTimeout(r, 2000))

// Extract all image sources
const images = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  const backgrounds = []
  document.querySelectorAll('*').forEach(el => {
    const style = window.getComputedStyle(el)
    const bg = style.backgroundImage
    if (bg && bg !== 'none' && bg.includes('url(')) {
      const match = bg.match(/url\(["']?([^"')]+)["']?\)/)
      if (match) backgrounds.push(match[1])
    }
  })
  return [
    ...imgs.map(img => img.src).filter(Boolean),
    ...backgrounds,
  ]
})

await browser.close()

// Filter: only real content images (not tiny icons, not placeholders)
const filtered = [...new Set(images)].filter(url => {
  if (!url.startsWith('http')) return false
  if (url.includes('data:')) return false
  if (url.includes('favicon')) return false
  if (url.includes('placeholder')) return false
  if (url.includes('placehold.co')) return false
  // Tilda CDN images
  return true
})

console.log(`Found ${filtered.length} images:`)
filtered.forEach(u => console.log(u))

// Download them
const outDir = './public/images/old-site'
fs.mkdirSync(outDir, { recursive: true })

let downloaded = 0
for (const imgUrl of filtered) {
  try {
    const u = new URL(imgUrl)
    const ext = path.extname(u.pathname) || '.jpg'
    const name = `img-${String(++downloaded).padStart(3,'0')}${ext}`
    const dest = path.join(outDir, name)
    if (fs.existsSync(dest)) continue
    await new Promise((resolve, reject) => {
      const proto = u.protocol === 'https:' ? https : http
      const file = fs.createWriteStream(dest)
      proto.get(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        if (res.statusCode !== 200) { file.close(); fs.unlinkSync(dest); resolve(); return }
        res.pipe(file)
        file.on('finish', () => { file.close(); resolve() })
        file.on('error', reject)
      }).on('error', reject)
    })
    const size = fs.statSync(dest).size
    if (size < 5000) { fs.unlinkSync(dest); downloaded--; continue } // skip tiny images
    console.log(`✓ ${name} (${Math.round(size/1024)}kb) ← ${imgUrl}`)
  } catch (e) {
    console.log(`✗ ${imgUrl}: ${e.message}`)
  }
}

console.log(`\nDone. Downloaded ${downloaded} images to ${outDir}`)
