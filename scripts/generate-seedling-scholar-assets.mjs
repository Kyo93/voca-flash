import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-chromium'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const sourcePath = path.join(__dirname, 'assets', 'seedling_scholar_cutout.png')
const outputRoot = path.join(repoRoot, 'public', 'character-assets', 'seedling_scholar')

const stateDurations = {
  idle: 1400,
  correct: 1200,
  wrong: 1100,
  celebrate: 1500,
  evolve: 1600,
}

const variants = [1, 2, 3].flatMap(stage =>
  Object.entries(stateDurations).map(([state, durationMs]) => ({
    stage,
    state,
    mood: state,
    durationMs,
  }))
)

function ensureSourceExists() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source cutout: ${sourcePath}`)
  }
}

function writeAsset(variant, extension, base64) {
  const outputDir = path.join(outputRoot, `stage-${variant.stage}`)
  fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, `${variant.state}.${extension}`)
  fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'))
  return path.relative(repoRoot, outputPath)
}

ensureSourceExists()

const sourceDataUrl = `data:image/png;base64,${fs.readFileSync(sourcePath).toString('base64')}`
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 })

await page.setContent('<!doctype html><html><body></body></html>')

try {
  for (const variant of variants) {
    const result = await page.evaluate(async ({ sourceDataUrl, variant }) => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext('2d')

      const image = await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = sourceDataUrl
      })

      function drawLeaf(cx, cy, size, rotation, fill, stroke = 'rgba(98, 74, 44, 0.35)') {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rotation)
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.bezierCurveTo(size * 0.9, -size * 0.35, size * 0.65, size * 0.9, 0, size)
        ctx.bezierCurveTo(-size * 0.65, size * 0.9, -size * 0.9, -size * 0.35, 0, -size)
        ctx.closePath()
        ctx.fillStyle = fill
        ctx.fill()
        ctx.strokeStyle = stroke
        ctx.lineWidth = Math.max(2, size * 0.08)
        ctx.stroke()
        ctx.restore()
      }

      function drawSpark(cx, cy, size, color, rotation = 0) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rotation)
        ctx.beginPath()
        for (let i = 0; i < 8; i += 1) {
          const radius = i % 2 === 0 ? size : size * 0.36
          const angle = (Math.PI * 2 * i) / 8
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.restore()
      }

      function drawRoundedRect(x, y, width, height, radius, fill, stroke) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fillStyle = fill
        ctx.fill()
        if (stroke) {
          ctx.strokeStyle = stroke
          ctx.lineWidth = 5
          ctx.stroke()
        }
      }

      function drawCheck(cx, cy, scale) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(scale, scale)
        ctx.beginPath()
        ctx.moveTo(-34, 0)
        ctx.lineTo(-10, 24)
        ctx.lineTo(38, -30)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)'
        ctx.lineWidth = 14
        ctx.stroke()
        ctx.restore()
      }

      function drawCross(cx, cy, scale) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(scale, scale)
        ctx.lineCap = 'round'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.96)'
        ctx.lineWidth = 14
        ctx.beginPath()
        ctx.moveTo(-28, -28)
        ctx.lineTo(28, 28)
        ctx.moveTo(28, -28)
        ctx.lineTo(-28, 28)
        ctx.stroke()
        ctx.restore()
      }

      function drawFloatingCard(cx, cy, rotation, scale, fill = 'rgba(255, 250, 236, 0.92)') {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rotation)
        ctx.scale(scale, scale)
        drawRoundedRect(-48, -64, 96, 128, 14, fill, 'rgba(163, 119, 64, 0.55)')
        ctx.beginPath()
        ctx.moveTo(-28, -18)
        ctx.lineTo(28, -18)
        ctx.moveTo(-28, 10)
        ctx.lineTo(16, 10)
        ctx.strokeStyle = 'rgba(104, 150, 118, 0.6)'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.restore()
      }

      function drawBackdrop(t) {
        const pulse = Math.sin(t * Math.PI * 2)
        const mood = variant.mood
        const stage = variant.stage

        if (stage >= 2) {
          ctx.save()
          const auraColor = stage === 2 ? 'rgba(106, 169, 139, 1)' : 'rgba(230, 174, 82, 1)'
          ctx.globalAlpha = stage === 2 ? 0.18 : 0.24
          ctx.fillStyle = auraColor
          ctx.beginPath()
          ctx.ellipse(512, 514, stage === 2 ? 300 : 338, stage === 2 ? 376 : 404, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          drawFloatingCard(246, 312 + pulse * 5, -0.22, 0.76)
          drawFloatingCard(792, 318 - pulse * 5, 0.26, 0.72)
          if (stage === 3) {
            drawSpark(512, 116, 42, 'rgba(244, 211, 110, 0.72)', t * 1.7)
            drawSpark(206, 610, 24, 'rgba(134, 196, 142, 0.64)', -t)
            drawSpark(844, 642, 28, 'rgba(244, 188, 88, 0.66)', t)
          }
        }

        if (mood === 'correct') {
          ctx.save()
          ctx.globalAlpha = 0.28 + pulse * 0.04
          ctx.fillStyle = 'rgba(88, 164, 118, 1)'
          ctx.beginPath()
          ctx.ellipse(520, 505, 306, 376, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          drawSpark(238, 222, 24, 'rgba(134, 196, 142, 0.86)', t * 1.5)
          drawSpark(812, 254, 18, 'rgba(244, 188, 88, 0.82)', -t * 2)
          ctx.fillStyle = 'rgba(81, 151, 107, 0.95)'
          ctx.beginPath()
          ctx.arc(788, 232, 60, 0, Math.PI * 2)
          ctx.fill()
          drawCheck(788, 232, 1)
        }

        if (mood === 'wrong') {
          ctx.save()
          ctx.globalAlpha = 0.22
          ctx.fillStyle = 'rgba(201, 99, 80, 1)'
          ctx.beginPath()
          ctx.ellipse(512, 514, 298, 358, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          ctx.fillStyle = 'rgba(191, 92, 78, 0.95)'
          ctx.beginPath()
          ctx.arc(790, 246, 56, 0, Math.PI * 2)
          ctx.fill()
          drawCross(790, 246, 0.92)
          drawSpark(244, 276, 18, 'rgba(230, 140, 112, 0.82)', t * 2.4)
        }

        if (mood === 'celebrate') {
          ctx.save()
          ctx.globalAlpha = 0.2 + Math.max(0, pulse) * 0.08
          ctx.fillStyle = 'rgba(244, 188, 88, 1)'
          ctx.beginPath()
          ctx.ellipse(512, 510, 330, 386, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          const confetti = [
            [210, 198, 0.4, 'rgba(88, 164, 118, 0.9)'],
            [302, 142, 0.8, 'rgba(230, 160, 86, 0.9)'],
            [742, 154, 1.3, 'rgba(102, 145, 186, 0.9)'],
            [834, 256, 0.1, 'rgba(177, 110, 88, 0.9)'],
            [778, 776, 1.1, 'rgba(88, 164, 118, 0.82)'],
            [226, 734, 0.7, 'rgba(244, 188, 88, 0.9)'],
          ]
          confetti.forEach(([x, y, r, color], index) => {
            ctx.save()
            ctx.translate(x + Math.sin(t * Math.PI * 2 + index) * 10, y + Math.cos(t * Math.PI * 2 + index) * 8)
            ctx.rotate(r + t * Math.PI)
            ctx.fillStyle = color
            ctx.fillRect(-8, -18, 16, 36)
            ctx.restore()
          })
          drawSpark(184, 330, 30, 'rgba(244, 188, 88, 0.86)', t)
          drawSpark(856, 360, 26, 'rgba(134, 196, 142, 0.86)', -t)
        }

        if (mood === 'evolve') {
          ctx.save()
          ctx.translate(512, 512)
          for (let i = 0; i < 4; i += 1) {
            ctx.rotate((t * Math.PI * 2) / 4 + i * (Math.PI / 2))
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(113, 171, 130, 0.46)' : 'rgba(244, 188, 88, 0.42)'
            ctx.lineWidth = 12 - i
            ctx.beginPath()
            ctx.ellipse(0, 0, 254 + i * 34, 356 + i * 18, 0, Math.PI * 0.12, Math.PI * 1.68)
            ctx.stroke()
          }
          ctx.restore()
          drawSpark(512, 118, 34, 'rgba(244, 216, 120, 0.92)', t * 2)
          drawSpark(822, 598, 24, 'rgba(134, 196, 142, 0.82)', -t * 2)
        }

      }

      function drawOverlay(t) {
        const mood = variant.mood
        if (variant.stage >= 2 || mood === 'evolve') {
          const baseY = variant.stage === 3 ? 148 : 162
          drawLeaf(488, baseY + Math.sin(t * Math.PI * 2) * 4, 30, -0.55, 'rgba(129, 187, 133, 0.92)')
          drawLeaf(536, baseY + Math.cos(t * Math.PI * 2) * 4, 32, 0.58, 'rgba(177, 206, 110, 0.92)')
          if (variant.stage === 3) {
            drawLeaf(512, baseY - 28, 28, 0, 'rgba(235, 191, 88, 0.95)')
          }
        }
      }

      function drawCharacter(t) {
        const mood = variant.mood
        const pulse = Math.sin(t * Math.PI * 2)
        let scale = variant.stage === 3 ? 0.79 : variant.stage === 2 ? 0.765 : 0.75
        let x = 512
        let y = variant.stage === 3 ? 496 : variant.stage === 2 ? 506 : 514
        let rotation = 0

        if (mood === 'correct') {
          y -= Math.max(0, pulse) * 18
          scale += 0.01 + Math.max(0, pulse) * 0.012
          rotation = Math.sin(t * Math.PI * 2) * 0.018
        } else if (mood === 'wrong') {
          x += Math.sin(t * Math.PI * 8) * 10
          rotation = Math.sin(t * Math.PI * 8) * 0.018
        } else if (mood === 'celebrate') {
          y -= 24 + Math.max(0, pulse) * 12
          rotation = Math.sin(t * Math.PI * 2) * 0.035
          scale = 0.765
        } else if (mood === 'evolve') {
          scale += 0.02 + Math.sin(t * Math.PI) * 0.045
          rotation = Math.sin(t * Math.PI * 2) * 0.025
        } else {
          y += pulse * 5
        }

        const drawSize = 1180 * scale
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.drawImage(image, -drawSize / 2, -drawSize / 2, drawSize, drawSize)
        ctx.restore()
      }

      function drawFrame(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawBackdrop(t)
        drawCharacter(t)
        drawOverlay(t)
      }

      function blobToBase64(blob) {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(String(reader.result).split(',')[1])
          reader.readAsDataURL(blob)
        })
      }

      drawFrame(0.16)
      const webpBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92))

      const stream = canvas.captureStream(24)
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2400000,
      })
      const chunks = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      const stopped = new Promise((resolve) => {
        recorder.onstop = resolve
      })

      recorder.start()
      const frameCount = Math.ceil((variant.durationMs / 1000) * 24)
      for (let frame = 0; frame <= frameCount; frame += 1) {
        drawFrame(frame / frameCount)
        await new Promise((resolve) => setTimeout(resolve, 1000 / 24))
      }
      recorder.stop()
      await stopped

      const webmBlob = new Blob(chunks, { type: mimeType })
      return {
        webp: await blobToBase64(webpBlob),
        webm: await blobToBase64(webmBlob),
      }
    }, { sourceDataUrl, variant })

    const webpPath = writeAsset(variant, 'webp', result.webp)
    const webmPath = writeAsset(variant, 'webm', result.webm)
    console.log(`wrote ${webpPath}`)
    console.log(`wrote ${webmPath}`)
  }
} finally {
  await browser.close()
}
