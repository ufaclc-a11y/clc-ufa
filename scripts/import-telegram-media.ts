#!/usr/bin/env node
/**
 * Импорт медиа из архива Telegram в проект CLC-UFA
 *
 * Запуск:
 *   npm run import-media
 *   npm run import-media -- --src="D:\TGArhiv" --out="public"
 */

import fs   from 'fs'
import path from 'path'

// ── Параметры ────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2)
const getArg  = (name: string, fallback: string) =>
  (args.find(a => a.startsWith(`--${name}=`)) ?? '').split('=')[1] ?? fallback

const SRC_DIR  = getArg('src', 'D:\\TGArhiv')
const OUT_DIR  = getArg('out', 'public')
const IMG_OUT  = path.join(OUT_DIR, 'images', 'imported')
const VID_OUT  = path.join(OUT_DIR, 'videos', 'imported')
const JSON_OUT = path.join('data', 'imported-media.json')

const IMG_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'])
const VID_EXTS = new Set(['.mp4', '.mov', '.avi', '.webm', '.mkv'])

// ── Типы ─────────────────────────────────────────────────────────────────────
type MediaItem = {
  originalPath: string
  filename:     string
  destPath:     string
  type:         'image' | 'video'
  ext:          string
  sizeKb:       number
  /**
   * Категория — заполнить вручную в data/imported-media.json
   * Доступные значения:
   * medali | tablichki | vyveski | uf-pechat | lazernaya-rezka |
   * gravirovka | frezernaya-rezka | b2b-detali | suveniры | inter-er | zagotovki
   */
  category:     string
  title:        string
  alt:          string
}

// ── Утилиты ──────────────────────────────────────────────────────────────────
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function walkDir(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walkDir(full, acc)
    else acc.push(full)
  }
  return acc
}

function pad(n: number): string { return String(n).padStart(4, '0') }

// ── Главная функция ───────────────────────────────────────────────────────────
async function main() {
  console.log(`\n📂 Сканируем: ${SRC_DIR}`)

  if (!fs.existsSync(SRC_DIR)) {
    console.error(`\n❌ Папка не найдена: ${SRC_DIR}`)
    console.error('   Передайте путь через аргумент: npm run import-media -- --src="D:\\TGArhiv"')
    process.exit(1)
  }

  const all    = walkDir(SRC_DIR)
  const images = all.filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))
  const videos = all.filter(f => VID_EXTS.has(path.extname(f).toLowerCase()))

  console.log(`✅ Найдено изображений : ${images.length}`)
  console.log(`✅ Найдено видео       : ${videos.length}`)

  fs.mkdirSync(IMG_OUT, { recursive: true })
  fs.mkdirSync(VID_OUT, { recursive: true })

  const items: MediaItem[] = []
  let imgN = 1, vidN = 1

  for (const src of images) {
    const ext     = path.extname(src).toLowerCase()
    const slug    = slugify(path.basename(src, ext))
    const fname   = `img-${pad(imgN++)}-${slug}${ext}`
    const dest    = path.join(IMG_OUT, fname)
    const sizeKb  = Math.round(fs.statSync(src).size / 1024)
    fs.copyFileSync(src, dest)
    items.push({
      originalPath: src,
      filename:     fname,
      destPath:     `/images/imported/${fname}`,
      type:         'image',
      ext,
      sizeKb,
      category:     'uncategorized',
      title:        slug.replace(/-/g, ' '),
      alt:          slug.replace(/-/g, ' '),
    })
    console.log(`  📸 ${fname} (${sizeKb} КБ)`)
  }

  for (const src of videos) {
    const ext     = path.extname(src).toLowerCase()
    const slug    = slugify(path.basename(src, ext))
    const fname   = `vid-${pad(vidN++)}-${slug}${ext}`
    const dest    = path.join(VID_OUT, fname)
    const sizeKb  = Math.round(fs.statSync(src).size / 1024)
    fs.copyFileSync(src, dest)
    items.push({
      originalPath: src,
      filename:     fname,
      destPath:     `/videos/imported/${fname}`,
      type:         'video',
      ext,
      sizeKb,
      category:     'uncategorized',
      title:        slug.replace(/-/g, ' '),
      alt:          slug.replace(/-/g, ' '),
    })
    console.log(`  🎬 ${fname} (${sizeKb} КБ)`)
  }

  fs.mkdirSync('data', { recursive: true })
  fs.writeFileSync(JSON_OUT, JSON.stringify(items, null, 2), 'utf-8')

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Готово!
   Импортировано: ${imgN - 1} фото, ${vidN - 1} видео
   Манифест: ${JSON_OUT}

📌 Следующие шаги:
   1. Откройте ${JSON_OUT}
   2. Для каждого файла заполните поле "category":
      medali | tablichki | vyveski | uf-pechat | lazernaya-rezka
      gravirovka | frezernaya-rezka | b2b-detali | suveniры | inter-er | zagotovki
   3. Лучшие фото скопируйте в public/images/portfolio/
   4. Добавьте записи в data/portfolio.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

main().catch(e => { console.error(e); process.exit(1) })
