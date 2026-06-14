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

// Intercept network to catch lazy-loaded images
const networkImages = new Set()
page.on('response', async res => {
  const url = res.url()
  const ct  = res.headers()['content-type'] || ''
  if ((ct.startsWith('image/') || url.match(/\.(jpe?g|png|webp|gif|svg)(\?|$)/i))
    && !url.includes('favicon') && !url.includes('spinner') && !url.includes('data:')) {
    networkImages.add(url)
  }
})

console.log('Loading page…')
await page.goto('https://clc-ufa.ru', { waitUntil: 'networkidle2', timeout: 45000 })

// 1. Slow full-page scroll to trigger lazy loading
console.log('Scrolling…')
await page.evaluate(async () => {
  await new Promise(resolve => {
    let pos = 0
    const timer = setInterval(() => {
      window.scrollBy(0, 300)
      pos += 300
      if (pos >= document.body.scrollHeight) { clearInterval(timer); resolve() }
    }, 80)
  })
})
await new Promise(r => setTimeout(r, 3000))

// 2. Scroll back to top then down again (second pass catches more lazy items)
await page.evaluate(() => window.scrollTo(0, 0))
await new Promise(r => setTimeout(r, 500))
await page.evaluate(async () => {
  await new Promise(resolve => {
    let pos = 0
    const timer = setInterval(() => {
      window.scrollBy(0, 200)
      pos += 200
      if (pos >= document.body.scrollHeight) { clearInterval(timer); resolve() }
    }, 60)
  })
})
await new Promise(r => setTimeout(r, 2000))

// 3. Click any "show more" / "all works" buttons
const moreSelectors = [
  'a[href*="portfolio"]', 'a[href*="gallery"]',
  '.t-btn', 'button',
  'a[href*="works"]', 'a[href*="raboty"]',
]
for (const sel of moreSelectors) {
  const els = await page.$$(sel)
  for (const el of els) {
    const txt = await el.evaluate(e => e.textContent?.toLowerCase() || '')
    if (txt.includes('все') || txt.includes('ещё') || txt.includes('портфолио') || txt.includes('галере')) {
      console.log(`Clicking: "${txt.trim()}"`)
      await el.click().catch(() => {})
      await new Promise(r => setTimeout(r, 2000))
    }
  }
}

// 4. Click gallery thumbnails to open lightboxes
const thumbSelectors = ['.t-slds__item', '.t-img', '[class*="gallery"] img', '[class*="portfolio"] img', 'figure img', '.t704__col img', '.t708']
for (const sel of thumbSelectors) {
  const els = await page.$$(sel)
  console.log(`Found ${els.length} elements matching ${sel}`)
  for (let i = 0; i < Math.min(els.length, 30); i++) {
    await els[i].click().catch(() => {})
    await new Promise(r => setTimeout(r, 600))
  }
  if (els.length) await new Promise(r => setTimeout(r, 1500))
}

// 5. Collect all image sources from DOM
const domImages = await page.evaluate(() => {
  const found = new Set()

  // img src + srcset
  document.querySelectorAll('img').forEach(img => {
    if (img.src) found.add(img.src)
    if (img.currentSrc) found.add(img.currentSrc)
    const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset') || ''
    srcset.split(',').forEach(part => {
      const u = part.trim().split(' ')[0]
      if (u) found.add(u)
    })
    // data-src (lazy)
    const ds = img.getAttribute('data-src') || img.getAttribute('data-lazy-src')
    if (ds) found.add(ds)
  })

  // background-image on every element
  document.querySelectorAll('*').forEach(el => {
    // inline style
    const bg = el.style?.backgroundImage
    if (bg && bg.includes('url(')) {
      const m = bg.match(/url\(["']?([^"')]+)["']?\)/)
      if (m) found.add(m[1])
    }
    // computed style
    try {
      const cBg = getComputedStyle(el).backgroundImage
      if (cBg && cBg !== 'none' && cBg.includes('url(')) {
        const m = cBg.match(/url\(["']?([^"')]+)["']?\)/)
        if (m) found.add(m[1])
      }
    } catch {}

    // data-original / data-src attrs (Tilda lazy)
    ;['data-original','data-src','data-lazy','data-bg'].forEach(attr => {
      const v = el.getAttribute(attr)
      if (v && v.startsWith('http')) found.add(v)
    })
  })

  // look in all <script> tags for tildacdn URLs
  document.querySelectorAll('script').forEach(s => {
    const text = s.textContent || ''
    const re = /https?:\/\/(?:optim|static|thb)\.tildacdn\.com\/[^\s"'<>)]+/g
    let m
    while ((m = re.exec(text)) !== null) found.add(m[0])
  })

  return [...found]
})

await browser.close()

// Merge all sources
const allUrls = new Set([...domImages, ...networkImages])

// Filter: only Tilda CDN content images, exclude tiny icons and SVG UI elements
const filtered = [...allUrls].filter(url => {
  if (!url.startsWith('http')) return false
  if (url.includes('data:')) return false
  if (url.includes('favicon')) return false
  if (url.includes('spinner')) return false
  if (url.includes('tildacopy')) return false
  if (url.includes('photo.svg') || url.includes('whats.svg') || url.includes('telegramm.svg')) return false
  if (url.match(/\.(svg)$/i) && !url.includes('tildacdn.com/tild')) return false
  if (!url.includes('tildacdn.com') && !url.includes('tilda.ws')) return false
  return true
})

console.log(`\nFound ${filtered.length} candidate image URLs:`)
filtered.forEach(u => console.log(' ', u))

// Convert optim/thb URLs to hi-res static originals
function toHires(url) {
  // optim.tildacdn.com/tild{hash}/-/resize/{w}x/-/format/webp/{file}.webp
  // thb.tildacdn.com/tild{hash}/-/resize/{w}x/{file}
  // → static.tildacdn.com/tild{hash}/{file}
  const m = url.match(/tildacdn\.com\/(tild[^/]+)\/.+\/([^/?#]+?)(?:\.webp)?(?:\?.*)?$/)
  if (!m) return url // already static or unrecognised
  const hash = m[1]
  let file = m[2]
  // remove trailing .webp suffix if the file extension is embedded in the filename
  if (file.endsWith('.webp') && !file.startsWith('tild')) {
    // the file had an extra .webp appended by optim CDN
    // do nothing; we already stripped it above
  }
  return `https://static.tildacdn.com/${hash}/${file}`
}

const outDir = './public/images/old-site'
fs.mkdirSync(outDir, { recursive: true })

const download = (url, dest) => new Promise((resolve, reject) => {
  if (fs.existsSync(dest)) { resolve('exists'); return }
  const file = fs.createWriteStream(dest)
  const proto = url.startsWith('https') ? https : http
  proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      file.close(); try { fs.unlinkSync(dest) } catch {}
      download(res.headers.location, dest).then(resolve).catch(reject)
      return
    }
    if (res.statusCode !== 200) { file.close(); try { fs.unlinkSync(dest) } catch {}; resolve('skip'); return }
    res.pipe(file)
    file.on('finish', () => { file.close(); resolve('ok') })
    file.on('error', reject)
  }).on('error', err => { file.close(); try { fs.unlinkSync(dest) } catch {}; reject(err) })
})

// Deduplicate by resolved hi-res URL
const seen = new Set()
let n = 0
let downloaded = 0
for (const rawUrl of filtered) {
  const hiresUrl = toHires(rawUrl)
  if (seen.has(hiresUrl)) continue
  seen.add(hiresUrl)

  n++
  const u = new URL(hiresUrl)
  const ext = path.extname(u.pathname) || '.jpg'
  const name = `deep-${String(n).padStart(3,'0')}${ext}`
  const dest = path.join(outDir, name)

  try {
    const result = await download(hiresUrl, dest)
    if (result === 'exists') { console.log(`• ${name} already exists`); continue }
    if (result === 'skip')   { console.log(`✗ ${name} — HTTP error ← ${hiresUrl}`); continue }
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0
    if (size < 3000) { fs.unlinkSync(dest); console.log(`✗ ${name} — too small (${size}b)`); n--; continue }
    console.log(`✓ ${name} (${Math.round(size/1024)}kb) ← ${hiresUrl}`)
    downloaded++
  } catch(e) {
    console.log(`✗ ${name} — ${e.message}`)
  }
}

console.log(`\nDone. Downloaded ${downloaded} new images to ${outDir}`)
