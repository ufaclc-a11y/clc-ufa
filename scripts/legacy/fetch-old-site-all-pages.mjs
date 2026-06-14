import puppeteer from 'puppeteer'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { URL } from 'url'

// ── Discover all pages via sitemap first ──────────────────────────────────────
const fetchText = url => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    if (res.statusCode === 301 || res.statusCode === 302)
      return fetchText(res.headers.location).then(resolve).catch(reject)
    let data = ''
    res.on('data', c => data += c)
    res.on('end', () => resolve(data))
  }).on('error', reject)
})

let extraPages = []
try {
  const sitemap = await fetchText('https://clc-ufa.ru/sitemap.xml')
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim())
  extraPages = locs.filter(u => u !== 'https://clc-ufa.ru/' && u !== 'https://clc-ufa.ru')
  console.log('Sitemap pages:', extraPages)
} catch(e) {
  console.log('No sitemap, will rely on link discovery:', e.message)
}

// ── Browser ───────────────────────────────────────────────────────────────────
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function toHires(url) {
  const m = url.match(/tildacdn\.com\/(tild[^/]+)\/.+\/([^/?#]+?)(?:\.webp)?(?:\?.*)?$/)
  if (!m) return url
  return `https://static.tildacdn.com/${m[1]}/${m[2]}`
}

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
  }).on('error', e => { file.close(); try { fs.unlinkSync(dest) } catch {}; reject(e) })
})

// ── Scrape a single page, return all image URLs found ─────────────────────────
async function scrapePage(pageUrl) {
  const page = await browser.newPage()
  const networkImages = new Set()

  page.on('response', res => {
    const u = res.url()
    const ct = res.headers()['content-type'] || ''
    if (
      (ct.startsWith('image/') || u.match(/\.(jpe?g|png|webp|gif)(\?|$)/i)) &&
      u.includes('tildacdn.com')
    ) networkImages.add(u)
  })

  try {
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 })
  } catch(e) {
    console.log(`  ✗ Failed to load ${pageUrl}: ${e.message}`)
    await page.close()
    return []
  }

  // Slow scroll
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let pos = 0
      const t = setInterval(() => {
        window.scrollBy(0, 300); pos += 300
        if (pos >= document.body.scrollHeight) { clearInterval(t); resolve() }
      }, 80)
    })
  })
  await new Promise(r => setTimeout(r, 2000))

  // Collect DOM images
  const domImages = await page.evaluate(() => {
    const found = new Set()
    document.querySelectorAll('img').forEach(img => {
      ;[img.src, img.currentSrc,
        img.getAttribute('data-src'), img.getAttribute('data-original'),
        img.getAttribute('data-lazy-src')
      ].filter(Boolean).forEach(u => found.add(u))
      const ss = img.getAttribute('srcset') || img.getAttribute('data-srcset') || ''
      ss.split(',').forEach(p => { const u = p.trim().split(' ')[0]; if(u) found.add(u) })
    })
    document.querySelectorAll('*').forEach(el => {
      ;['data-original','data-src','data-lazy','data-bg'].forEach(a => {
        const v = el.getAttribute(a)
        if (v && v.startsWith('http') && v.includes('tildacdn')) found.add(v)
      })
      const bg = el.style?.backgroundImage
      if (bg && bg.includes('url(')) {
        const m = bg.match(/url\(["']?([^"')]+)["']?\)/); if(m) found.add(m[1])
      }
    })
    // scan scripts for tildacdn URLs
    document.querySelectorAll('script').forEach(s => {
      const re = /https?:\/\/(?:optim|static|thb)\.tildacdn\.com\/tild[^\s"'<>)]+/g
      let m; while((m = re.exec(s.textContent||'')) !== null) found.add(m[0])
    })
    return [...found]
  })

  await page.close()

  const all = [...new Set([...domImages, ...networkImages])]
  return all.filter(u =>
    u.startsWith('http') &&
    u.includes('tildacdn.com') &&
    !u.includes('favicon') && !u.includes('spinner') &&
    !u.includes('tildacopy') &&
    !u.match(/\/(photo|whats|telegramm|vk|fb|ok|tw)\.svg/)
  )
}

// ── Main: scrape all pages ────────────────────────────────────────────────────
const pagesToScrape = ['https://clc-ufa.ru', ...extraPages]
const allImageUrls = new Set()

for (const pageUrl of pagesToScrape) {
  console.log(`\nScraping: ${pageUrl}`)
  const urls = await scrapePage(pageUrl)
  console.log(`  Found ${urls.length} image URLs`)
  urls.forEach(u => allImageUrls.add(u))
}

await browser.close()

// ── Download all unique hi-res originals ──────────────────────────────────────
const outDir = './public/images/old-site'
fs.mkdirSync(outDir, { recursive: true })

// Convert to hi-res and deduplicate
const hiresMap = new Map() // hiresUrl → originalUrl
for (const u of allImageUrls) {
  const h = toHires(u)
  if (!hiresMap.has(h)) hiresMap.set(h, u)
}

console.log(`\nTotal unique hi-res URLs: ${hiresMap.size}`)

let n = 0, downloaded = 0
for (const [hiresUrl] of hiresMap) {
  n++
  let ext
  try {
    ext = path.extname(new URL(hiresUrl).pathname) || '.jpg'
  } catch { ext = '.jpg' }

  const name = `page-${String(n).padStart(3,'0')}${ext}`
  const dest = path.join(outDir, name)

  try {
    const result = await download(hiresUrl, dest)
    if (result === 'exists') { console.log(`• ${name} already exists`); continue }
    if (result === 'skip')   { console.log(`✗ ${name} — HTTP error ← ${hiresUrl}`); continue }
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0
    if (size < 3000) { fs.unlinkSync(dest); console.log(`✗ ${name} — too small (${size}b)`); continue }
    console.log(`✓ ${name} (${Math.round(size/1024)}kb) ← ${hiresUrl}`)
    downloaded++
  } catch(e) {
    console.log(`✗ — ${e.message} ← ${hiresUrl}`)
  }
}

console.log(`\nDone. Downloaded ${downloaded} images to ${outDir}`)
