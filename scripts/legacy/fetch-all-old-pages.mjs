import puppeteer from 'puppeteer'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { URL } from 'url'

const pages = [
  'https://clc-ufa.ru/',
  'https://clc-ufa.ru/about',
  'https://clc-ufa.ru/contact',
  'https://clc-ufa.ru/store',
  'https://clc-ufa.ru/home-direct-optimized',
  'https://clc-ufa.ru/non-work-page',
  'https://clc-ufa.ru/page73520349.html',
  'https://clc-ufa.ru/page137019166.html',
  // Изделия
  'https://clc-ufa.ru/izgotovlenie-izdelii',
  'https://clc-ufa.ru/izgotovlenie-izdelii-organajzery',
  'https://clc-ufa.ru/izgotovlenie-izdelii-kormushki',
  'https://clc-ufa.ru/izgotovlenie-izdelii-kopilki',
  'https://clc-ufa.ru/izgotovlenie-izdelii-medalnica',
  'https://clc-ufa.ru/izgotovlenie-izdelii-zagotovkidlyatvorchestva',
  'https://clc-ufa.ru/izgotovlenie-izdelii-chasy',
  'https://clc-ufa.ru/izgotovlenie-izdelii-vyveski',
  'https://clc-ufa.ru/izgotovlenie-izdelii-klyuchnica',
  'https://clc-ufa.ru/acril-klishe',
  'https://clc-ufa.ru/signposts',
  // Лазерная резка
  'https://clc-ufa.ru/laser-rez',
  'https://clc-ufa.ru/lazer-rez-fanera',
  'https://clc-ufa.ru/lazer-rez-acril',
  'https://clc-ufa.ru/lazer-rez-karton',
  'https://clc-ufa.ru/lazer-rez-trafaret',
  'https://clc-ufa.ru/lazer-rez-nomerki',
  'https://clc-ufa.ru/lazer-rez-menuholder',
  'https://clc-ufa.ru/lazer-rez-breloki',
  'https://clc-ufa.ru/lazer-rez-beidjiki',
  'https://clc-ufa.ru/lazer-rez-shkatulki',
  'https://clc-ufa.ru/lazer-rez-statuetki',
  'https://clc-ufa.ru/lazer-rez-heshtegi',
  'https://clc-ufa.ru/shildiki',
  // УФ-печать
  'https://clc-ufa.ru/uv-print',
  'https://clc-ufa.ru/uv-print-fanera',
  'https://clc-ufa.ru/uv-print-koja',
  'https://clc-ufa.ru/uv-print-plastick',
  'https://clc-ufa.ru/uv-print-acrill',
  'https://clc-ufa.ru/uv-print-medali',
  'https://clc-ufa.ru/uvdtf',
  // Фрезеровка
  'https://clc-ufa.ru/frezer-rez',
  'https://clc-ufa.ru/frezer-rez-fanery',
  'https://clc-ufa.ru/frezer-rez-mdf',
  'https://clc-ufa.ru/frezer-rez-akrila',
  'https://clc-ufa.ru/frezer-rez-dereva',
  'https://clc-ufa.ru/frezer-rez-pvh',
  'https://clc-ufa.ru/frezer-rez-menazhnic',
  // Гравировка на металле
  'https://clc-ufa.ru/gravirovka-na-metalle',
  'https://clc-ufa.ru/gravirovka-na-metalle-zhetony',
  'https://clc-ufa.ru/gravirovka-na-metalle-nozh',
  'https://clc-ufa.ru/gravirovka-na-metalle-medallyah',
  'https://clc-ufa.ru/gravirovka-na-metalle-termosah',
  'https://clc-ufa.ru/gravirovka-na-metalle-kruzhkah',
  'https://clc-ufa.ru/gravirovka-na-metalle-adresniki',
  'https://clc-ufa.ru/gravirovka-na-metalle-kulon',
  // Гравировка на дереве/пластике/коже
  'https://clc-ufa.ru/graver-wood',
  'https://clc-ufa.ru/graver-wood-fanera',
  'https://clc-ufa.ru/graver-wood-kozhi',
  'https://clc-ufa.ru/graver-wood-ekokozhi',
  'https://clc-ufa.ru/graver-wood-dereve',
  'https://clc-ufa.ru/graver-wood-plastike',
  'https://clc-ufa.ru/graver-wood-brelokah',
  'https://clc-ufa.ru/graver-wood-organajzerah',
  'https://clc-ufa.ru/graver-wood-menazhnicah',
]

// Slug → semantic category label for file naming
const slugLabel = {
  '/':                                          'main',
  '/about':                                     'about',
  '/contact':                                   'contact',
  '/store':                                     'store',
  '/home-direct-optimized':                     'main-opt',
  '/non-work-page':                             'non-work',
  '/page73520349.html':                         'page1',
  '/page137019166.html':                        'page2',
  '/izgotovlenie-izdelii':                      'izd-main',
  '/izgotovlenie-izdelii-organajzery':          'izd-organajzery',
  '/izgotovlenie-izdelii-kormushki':            'izd-kormushki',
  '/izgotovlenie-izdelii-kopilki':              'izd-kopilki',
  '/izgotovlenie-izdelii-medalnica':            'izd-medalnica',
  '/izgotovlenie-izdelii-zagotovkidlyatvorchestva': 'izd-zagotovki',
  '/izgotovlenie-izdelii-chasy':                'izd-chasy',
  '/izgotovlenie-izdelii-vyveski':              'izd-vyveski',
  '/izgotovlenie-izdelii-klyuchnica':           'izd-klyuchnica',
  '/acril-klishe':                              'izd-klishe',
  '/signposts':                                 'izd-signposts',
  '/laser-rez':                                 'laser-main',
  '/lazer-rez-fanera':                          'laser-fanera',
  '/lazer-rez-acril':                           'laser-akril',
  '/lazer-rez-karton':                          'laser-karton',
  '/lazer-rez-trafaret':                        'laser-trafaret',
  '/lazer-rez-nomerki':                         'laser-nomerki',
  '/lazer-rez-menuholder':                      'laser-menuholder',
  '/lazer-rez-breloki':                         'laser-breloki',
  '/lazer-rez-beidjiki':                        'laser-bejdzhi',
  '/lazer-rez-shkatulki':                       'laser-shkatulki',
  '/lazer-rez-statuetki':                       'laser-statuetki',
  '/lazer-rez-heshtegi':                        'laser-heshtegi',
  '/shildiki':                                  'laser-shildiki',
  '/uv-print':                                  'uv-main',
  '/uv-print-fanera':                           'uv-fanera',
  '/uv-print-koja':                             'uv-kozha',
  '/uv-print-plastick':                         'uv-plastik',
  '/uv-print-acrill':                           'uv-akril',
  '/uv-print-medali':                           'uv-medali',
  '/uvdtf':                                     'uv-dtf',
  '/frezer-rez':                                'frez-main',
  '/frezer-rez-fanery':                         'frez-fanera',
  '/frezer-rez-mdf':                            'frez-mdf',
  '/frezer-rez-akrila':                         'frez-akril',
  '/frezer-rez-dereva':                         'frez-derevo',
  '/frezer-rez-pvh':                            'frez-pvh',
  '/frezer-rez-menazhnic':                      'frez-menazhnica',
  '/gravirovka-na-metalle':                     'grav-metal-main',
  '/gravirovka-na-metalle-zhetony':             'grav-metal-zheton',
  '/gravirovka-na-metalle-nozh':                'grav-metal-nozh',
  '/gravirovka-na-metalle-medallyah':           'grav-metal-medal',
  '/gravirovka-na-metalle-termosah':            'grav-metal-termos',
  '/gravirovka-na-metalle-kruzhkah':            'grav-metal-kruzhka',
  '/gravirovka-na-metalle-adresniki':           'grav-metal-adresnik',
  '/gravirovka-na-metalle-kulon':               'grav-metal-kulon',
  '/graver-wood':                               'grav-wood-main',
  '/graver-wood-fanera':                        'grav-wood-fanera',
  '/graver-wood-kozhi':                         'grav-wood-kozha',
  '/graver-wood-ekokozhi':                      'grav-wood-ekokozha',
  '/graver-wood-dereve':                        'grav-wood-derevo',
  '/graver-wood-plastike':                      'grav-wood-plastik',
  '/graver-wood-brelokah':                      'grav-wood-brelock',
  '/graver-wood-organajzerah':                  'grav-wood-organajzer',
  '/graver-wood-menazhnicah':                   'grav-wood-menazhnica',
}

function getLabel(pageUrl) {
  try {
    const slug = new URL(pageUrl).pathname
    return slugLabel[slug] || slug.replace(/\//g, '-').replace(/^-/, '') || 'page'
  } catch { return 'page' }
}

function toHires(url) {
  // optim/thb → static
  const m = url.match(/tildacdn\.com\/(tild[^/]+)\/.+\/([^/?#]+?)(?:\.webp)?(?:\?.*)?$/)
  if (!m) {
    // already static.tildacdn.com/tild.../file
    return url
  }
  return `https://static.tildacdn.com/${m[1]}/${m[2]}`
}

const isContentImage = url => {
  if (!url.startsWith('http')) return false
  if (!url.includes('tildacdn.com')) return false
  if (url.includes('favicon'))    return false
  if (url.includes('spinner'))    return false
  if (url.includes('tildacopy'))  return false
  if (url.match(/\/(photo|whats|telegramm|vk|fb|ok|tw|inst|yt)\.svg/)) return false
  // skip tiny icons: SVGs except ones with tild hash paths
  if (url.match(/\.svg(\?|$)/i) && !url.match(/\/tild[^/]+\/[^/]+\.svg/)) return false
  return true
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
    if (res.statusCode !== 200) {
      file.close(); try { fs.unlinkSync(dest) } catch {}
      resolve('skip'); return
    }
    res.pipe(file)
    file.on('finish', () => { file.close(); resolve('ok') })
    file.on('error', reject)
  }).on('error', e => { file.close(); try { fs.unlinkSync(dest) } catch {}; reject(e) })
})

// ── Launch browser ─────────────────────────────────────────────────────────────
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

// ── Scrape one page ────────────────────────────────────────────────────────────
async function scrapePage(pageUrl) {
  const pg = await browser.newPage()
  const netImgs = new Set()

  pg.on('response', res => {
    const u = res.url()
    if (u.includes('tildacdn.com') && isContentImage(u)) netImgs.add(u)
  })

  try {
    await pg.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 })
  } catch(e) {
    console.log(`  ✗ load error: ${e.message}`)
    await pg.close(); return []
  }

  // full scroll
  await pg.evaluate(async () => {
    await new Promise(resolve => {
      let pos = 0
      const t = setInterval(() => {
        window.scrollBy(0, 250); pos += 250
        if (pos >= document.body.scrollHeight) { clearInterval(t); resolve() }
      }, 70)
    })
  })
  await new Promise(r => setTimeout(r, 1500))

  const domImgs = await pg.evaluate(() => {
    const s = new Set()
    document.querySelectorAll('img').forEach(img => {
      ;[img.src, img.currentSrc,
        img.getAttribute('data-src'),
        img.getAttribute('data-original'),
        img.getAttribute('data-lazy-src'),
      ].filter(Boolean).forEach(u => s.add(u))
      ;(img.getAttribute('srcset')||img.getAttribute('data-srcset')||'')
        .split(',').forEach(p => { const u=p.trim().split(' ')[0]; if(u) s.add(u) })
    })
    document.querySelectorAll('*').forEach(el => {
      ;['data-original','data-src','data-lazy','data-bg','data-field-value'].forEach(a => {
        const v = el.getAttribute(a)
        if (v && v.includes('tildacdn')) s.add(v)
      })
      const bg = el.style?.backgroundImage
      if (bg && bg.includes('tildacdn')) {
        const m = bg.match(/url\(["']?([^"')]+)["']?\)/); if(m) s.add(m[1])
      }
    })
    // scripts
    document.querySelectorAll('script').forEach(sc => {
      const re = /https?:\/\/(?:optim|static|thb)\.tildacdn\.com\/tild[^\s"'<>),]+/g
      let m; while((m = re.exec(sc.textContent||''))!==null) s.add(m[0])
    })
    return [...s]
  })

  await pg.close()
  return [...new Set([...domImgs, ...netImgs])]
}

// ── Run all pages ──────────────────────────────────────────────────────────────
// Map from hiresUrl → { label, ext }
const collected = new Map()

for (const pageUrl of pages) {
  const label = getLabel(pageUrl)
  console.log(`\n[${label}] ${pageUrl}`)
  const urls = await scrapePage(pageUrl)
  let added = 0
  for (const u of urls) {
    if (!isContentImage(u)) continue
    const hi = toHires(u)
    if (!collected.has(hi)) {
      let ext = '.jpg'
      try { ext = path.extname(new URL(hi).pathname) || '.jpg' } catch {}
      collected.set(hi, { label, ext })
      added++
    }
  }
  console.log(`  ${urls.filter(isContentImage).length} images found, ${added} new unique`)
}

await browser.close()

// ── Download ───────────────────────────────────────────────────────────────────
const outDir = './public/images/old-site'
fs.mkdirSync(outDir, { recursive: true })

console.log(`\nTotal unique hi-res images: ${collected.size}`)
console.log('Downloading…\n')

// Group by label for nice file names
const labelCounters = {}
let totalDownloaded = 0

for (const [hiresUrl, { label, ext }] of collected) {
  labelCounters[label] = (labelCounters[label] || 0) + 1
  const n = String(labelCounters[label]).padStart(2, '0')
  const name = `${label}-${n}${ext}`
  const dest = path.join(outDir, name)

  try {
    const result = await download(hiresUrl, dest)
    if (result === 'exists') { console.log(`• ${name} (exists)`); continue }
    if (result === 'skip')   { console.log(`✗ ${name} — HTTP error ← ${hiresUrl}`); continue }
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0
    if (size < 3000) {
      fs.unlinkSync(dest)
      console.log(`✗ ${name} — too small (${size}b)`)
      continue
    }
    console.log(`✓ ${name} (${Math.round(size/1024)}kb)  ← ${hiresUrl}`)
    totalDownloaded++
  } catch(e) {
    console.log(`✗ ${name} — ${e.message}`)
  }
}

console.log(`\n✅ Done. Downloaded ${totalDownloaded} images to ${outDir}`)
