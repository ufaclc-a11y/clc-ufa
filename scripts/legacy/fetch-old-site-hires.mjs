import https from 'https'
import fs from 'fs'
import path from 'path'

// Tilda thumbnail → original mapping
// optim.tildacdn.com/tild{hash}/-/resize/{w}x/-/format/webp/{file}.webp
// → static.tildacdn.com/tild{hash}/{file}
const thumbs = [
  'https://optim.tildacdn.com/tild3331-6262-4630-b835-623931313763/-/resize/411x/-/format/webp/6.jpeg.webp',
  'https://optim.tildacdn.com/tild3634-6339-4435-b965-303032373864/-/resize/328x/-/format/webp/7.jpeg.webp',
  'https://optim.tildacdn.com/tild3333-3039-4466-a263-373765303862/-/resize/308x/-/format/webp/8.jpeg.webp',
  'https://optim.tildacdn.com/tild3531-6333-4532-a236-333434646337/-/resize/308x/-/format/webp/1.jpeg.webp',
  'https://optim.tildacdn.com/tild3162-3431-4166-b065-353736376432/-/resize/255x/-/format/webp/1.jpeg.webp',
  'https://optim.tildacdn.com/tild3139-6561-4666-b430-383262353261/-/resize/403x/-/format/webp/2.jpeg.webp',
  'https://optim.tildacdn.com/tild6431-6330-4166-b764-376433383833/-/resize/242x/-/format/webp/3.jpeg.webp',
  'https://optim.tildacdn.com/tild3837-3734-4732-b664-333235353861/-/resize/454x/-/format/webp/4.jpeg.webp',
  'https://optim.tildacdn.com/tild6566-3933-4234-a435-333338396461/-/resize/420x/-/format/webp/5.jpeg.webp',
  'https://optim.tildacdn.com/tild3561-6434-4363-a662-633439656434/-/resize/284x/-/format/webp/10.jpeg.webp',
  'https://optim.tildacdn.com/tild3863-3537-4363-a262-633130346464/-/resize/284x/-/format/webp/11.png.webp',
  'https://optim.tildacdn.com/tild6334-6464-4761-b136-633035323466/-/resize/284x/-/format/webp/c6059788-aba0-48e3-8.jpeg.webp',
]

function thumbToOriginal(url) {
  // Extract hash and filename
  const m = url.match(/tildacdn\.com\/(tild[^/]+)\/.+\/([^/]+)\.webp$/)
  if (!m) return null
  const hash = m[1]
  const file = m[2] // e.g. "6.jpeg"
  return `https://static.tildacdn.com/${hash}/${file}`
}

const outDir = './public/images/old-site'
fs.mkdirSync(outDir, { recursive: true })

const download = (url, dest) => new Promise((resolve, reject) => {
  if (fs.existsSync(dest)) { resolve('exists'); return }
  const file = fs.createWriteStream(dest)
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      file.close(); fs.unlinkSync(dest)
      download(res.headers.location, dest).then(resolve).catch(reject)
      return
    }
    if (res.statusCode !== 200) { file.close(); fs.unlinkSync(dest); resolve('skip'); return }
    res.pipe(file)
    file.on('finish', () => { file.close(); resolve('ok') })
    file.on('error', reject)
  }).on('error', err => { file.close(); try { fs.unlinkSync(dest) } catch {} reject(err) })
})

for (let i = 0; i < thumbs.length; i++) {
  const orig = thumbToOriginal(thumbs[i])
  if (!orig) { console.log(`✗ Could not parse: ${thumbs[i]}`); continue }
  const ext = path.extname(orig.split('?')[0]) || '.jpg'
  const name = `hires-${String(i+1).padStart(2,'0')}${ext}`
  const dest = path.join(outDir, name)
  const result = await download(orig, dest)
  if (result === 'exists') { console.log(`• ${name} already exists`); continue }
  if (result === 'skip')   { console.log(`✗ ${name} — HTTP error`); continue }
  const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0
  console.log(`✓ ${name} (${Math.round(size/1024)}kb) ← ${orig}`)
}
console.log('Done')
