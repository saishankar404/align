import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgBuffer = readFileSync(join(__dirname, '../public/pwa-icon.svg'))

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 180, name: 'icons/apple-touch-icon.png' },
  { size: 192, name: 'icons/icon-192.png' },
  { size: 512, name: 'icons/icon-512.png' },
]

for (const { size, name } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toFile(join(__dirname, '../public', name))
  console.log(`Generated public/${name}`)
}

console.log('Done.')
