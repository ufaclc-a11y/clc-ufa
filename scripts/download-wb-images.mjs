/**
 * Скачивает изображения товаров WB локально в public/shop-images/
 * Перебирает корзины 1–25, пока не найдёт рабочий URL.
 * Запуск: node scripts/download-wb-images.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'shop-images')
const RAW_FILE = path.join(ROOT, 'data', 'wb-products-raw.json')
const SHOP_TS  = path.join(ROOT, 'data', 'shop.ts')

// ── Корзинный маппинг WB (расширенный до 25) ──────────────────────────
function getBasket(vol) {
  if (vol <= 143)  return '01'
  if (vol <= 287)  return '02'
  if (vol <= 431)  return '03'
  if (vol <= 719)  return '04'
  if (vol <= 1007) return '05'
  if (vol <= 1061) return '06'
  if (vol <= 1115) return '07'
  if (vol <= 1169) return '08'
  if (vol <= 1313) return '09'
  if (vol <= 1601) return '10'
  if (vol <= 1655) return '11'
  if (vol <= 1919) return '12'
  if (vol <= 2045) return '13'
  if (vol <= 2189) return '14'
  if (vol <= 2405) return '15'
  if (vol <= 2621) return '16'
  if (vol <= 2837) return '17'
  if (vol <= 3053) return '18'
  if (vol <= 3269) return '19'
  if (vol <= 3485) return '20'
  if (vol <= 3701) return '21'
  if (vol <= 3917) return '22'
  if (vol <= 4133) return '23'
  if (vol <= 4349) return '24'
  return '25'
}

function wbUrl(nmID) {
  const vol  = Math.floor(nmID / 100000)
  const part = Math.floor(nmID / 1000)
  const basket = getBasket(vol)
  return `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${nmID}/images/big/1.webp`
}

// ── Fetch с таймаутом ──────────────────────────────────────────────────
async function fetchWithTimeout(url, timeout = 8000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Referer':    'https://www.wildberries.ru/',
        'Accept':     'image/webp,image/avif,image/*,*/*',
      },
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

// ── Найти рабочий basket-URL перебором ────────────────────────────────
async function findWorkingUrl(nmID) {
  const vol  = Math.floor(nmID / 100000)
  const part = Math.floor(nmID / 1000)

  // Сначала пробуем расчётный basket
  const primary = wbUrl(nmID)
  try {
    const r = await fetchWithTimeout(primary)
    if (r.ok) return { url: primary, res: r }
  } catch {}

  // Умный старт: для больших vol расширяем диапазон поиска
  // Приблизительно ~300 vol на basket после basket-22
  const startBasket = vol > 3702 ? Math.max(22, Math.floor(22 + (vol - 3702) / 300) - 2) : 1
  const endBasket = Math.min(50, startBasket + 10)

  for (let b = startBasket; b <= endBasket; b++) {
    const basket = String(b).padStart(2, '0')
    const url = `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${nmID}/images/big/1.webp`
    try {
      const r = await fetchWithTimeout(url)
      if (r.ok) return { url, res: r }
    } catch {}
  }

  // Если не нашли — расширяем до полного диапазона
  for (let b = 1; b <= 50; b++) {
    if (b >= startBasket && b <= endBasket) continue // уже проверяли
    const basket = String(b).padStart(2, '0')
    const url = `https://basket-${basket}.wbbasket.ru/vol${vol}/part${part}/${nmID}/images/big/1.webp`
    try {
      const r = await fetchWithTimeout(url)
      if (r.ok) return { url, res: r }
    } catch {}
  }

  return null
}

// ── Главный скрипт ─────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const products = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'))
  console.log(`Processing ${products.length} products…\n`)

  const imageMap = {}   // nmID → local path or null
  let ok = 0, fail = 0

  for (const p of products) {
    const localFile = path.join(OUT_DIR, `${p.id}.webp`)

    // Уже скачан — пропускаем
    if (fs.existsSync(localFile) && fs.statSync(localFile).size > 1000) {
      imageMap[p.id] = `/shop-images/${p.id}.webp`
      console.log(`  ✓ skip  ${p.id}`)
      ok++
      continue
    }

    process.stdout.write(`  ↓ fetch ${p.id} … `)
    const result = await findWorkingUrl(p.id)

    if (!result) {
      console.log('❌ not found')
      imageMap[p.id] = null
      fail++
      continue
    }

    const buf = Buffer.from(await result.res.arrayBuffer())
    fs.writeFileSync(localFile, buf)
    imageMap[p.id] = `/shop-images/${p.id}.webp`
    console.log(`✓  (${(buf.length / 1024).toFixed(0)} KB)  ${result.url}`)
    ok++

    // Небольшая пауза чтобы не флудить WB
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\nDone: ${ok} OK, ${fail} failed`)

  // ── Обновляем data/shop.ts: меняем image на локальный путь ───────────
  let shopTs = fs.readFileSync(SHOP_TS, 'utf8')

  for (const [id, localPath] of Object.entries(imageMap)) {
    if (!localPath) continue
    // Заменяем строку "image": "https://basket-XX..." на локальный путь
    const re = new RegExp(`("image":\\s*)"https://basket-[^"]+/${id}/[^"]+"`, 'g')
    shopTs = shopTs.replace(re, `$1"${localPath}"`)
  }

  fs.writeFileSync(SHOP_TS, shopTs)
  console.log('data/shop.ts updated with local image paths.')

  if (fail > 0) {
    console.log(`\n⚠️  ${fail} products have no image — they will show the fallback icon.`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
