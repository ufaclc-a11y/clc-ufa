import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const dir = './temporary screenshots'
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 })

// Прокрутка для lazy-load
await page.evaluate(async () => {
  await new Promise(resolve => {
    let current = 0
    const timer = setInterval(() => {
      window.scrollBy(0, 600)
      current += 600
      if (current >= document.body.scrollHeight) {
        clearInterval(timer)
        window.scrollTo(0, 0)
        resolve()
      }
    }, 120)
  })
})
await new Promise(r => setTimeout(r, 1500))

const totalHeight = await page.evaluate(() => document.body.scrollHeight)
console.log('Total page height:', totalHeight)

const step = 900
let idx = 45
for (let y = 0; y < totalHeight; y += step) {
  await page.evaluate(pos => window.scrollTo(0, pos), y)
  await new Promise(r => setTimeout(r, 350))
  const file = path.join(dir, `screenshot-${idx}-y${y}.png`)
  await page.screenshot({ path: file })
  console.log(file)
  idx++
}

await browser.close()
