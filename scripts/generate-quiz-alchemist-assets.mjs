import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-chromium'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const characterId = 'quiz_alchemist'
const sourcePath = path.join(__dirname, 'assets', `${characterId}_cutout.png`)
const outputRoot = path.join(repoRoot, 'public', 'character-assets', characterId)

const stateDurations = {
  idle: 1400,
  correct: 1200,
  wrong: 1100,
  celebrate: 1500,
  evolve: 1600,
}

const variants = [1, 2, 3, 4].flatMap(stage =>
  Object.entries(stateDurations).map(([state, durationMs]) => ({
    stage,
    state,
    durationMs,
  }))
)

function writeAsset(variant, extension, base64) {
  const outputDir = path.join(outputRoot, `stage-${variant.stage}`)
  fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, `${variant.state}.${extension}`)
  fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'))
  return path.relative(repoRoot, outputPath)
}

async function generateSourceCutout(page) {
  const png = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')

    function drawRoundedRect(x, y, width, height, radius, fill, stroke, lineWidth = 5) {
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
        ctx.lineWidth = lineWidth
        ctx.stroke()
      }
    }

    function drawSpark(cx, cy, size, color, rotation = 0) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.beginPath()
      for (let i = 0; i < 8; i += 1) {
        const radius = i % 2 === 0 ? size : size * 0.34
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

    function drawVial(cx, cy, rotation, scale, liquid) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.scale(scale, scale)
      drawRoundedRect(-24, -76, 48, 32, 10, 'rgba(226, 235, 224, 0.92)', 'rgba(69, 112, 120, 0.7)', 5)
      drawRoundedRect(-52, -44, 104, 132, 28, 'rgba(230, 248, 246, 0.48)', 'rgba(69, 112, 120, 0.68)', 6)
      ctx.fillStyle = liquid
      ctx.beginPath()
      ctx.ellipse(0, 34, 44, 38, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.7
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.beginPath()
      ctx.ellipse(-18, -10, 8, 22, -0.25, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function drawFormulaCard(cx, cy, rotation, scale) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.scale(scale, scale)
      drawRoundedRect(-58, -78, 116, 156, 18, 'rgba(255, 249, 236, 0.96)', 'rgba(180, 119, 72, 0.55)', 5)
      ctx.strokeStyle = 'rgba(42, 126, 120, 0.62)'
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-30, -26)
      ctx.lineTo(18, -26)
      ctx.moveTo(-28, 4)
      ctx.lineTo(30, 4)
      ctx.moveTo(-18, 34)
      ctx.lineTo(12, 34)
      ctx.stroke()
      ctx.fillStyle = 'rgba(229, 159, 73, 0.8)'
      ctx.beginPath()
      ctx.arc(28, -38, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function drawCrystal(cx, cy, size, color) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(size * 0.66, -size * 0.18)
      ctx.lineTo(size * 0.42, size * 0.86)
      ctx.lineTo(-size * 0.42, size * 0.86)
      ctx.lineTo(-size * 0.66, -size * 0.18)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = 'rgba(84, 93, 98, 0.32)'
      ctx.lineWidth = 5
      ctx.stroke()
      ctx.restore()
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.shadowColor = 'rgba(48, 73, 78, 0.22)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 18

    ctx.fillStyle = 'rgba(42, 111, 108, 0.96)'
    ctx.beginPath()
    ctx.ellipse(512, 662, 218, 272, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(245, 217, 137, 0.96)'
    ctx.beginPath()
    ctx.moveTo(344, 502)
    ctx.quadraticCurveTo(512, 396, 680, 502)
    ctx.lineTo(632, 626)
    ctx.quadraticCurveTo(512, 706, 392, 626)
    ctx.closePath()
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(57, 78, 84, 0.24)'
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(512, 446)
    ctx.quadraticCurveTo(472, 560, 508, 738)
    ctx.moveTo(512, 446)
    ctx.quadraticCurveTo(560, 560, 538, 740)
    ctx.stroke()

    ctx.fillStyle = 'rgba(249, 211, 154, 1)'
    ctx.beginPath()
    ctx.ellipse(512, 382, 118, 132, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(61, 78, 83, 0.82)'
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.arc(462, 374, 34, 0, Math.PI * 2)
    ctx.arc(562, 374, 34, 0, Math.PI * 2)
    ctx.moveTo(496, 374)
    ctx.lineTo(528, 374)
    ctx.stroke()

    ctx.fillStyle = 'rgba(51, 62, 66, 0.88)'
    ctx.beginPath()
    ctx.arc(462, 376, 8, 0, Math.PI * 2)
    ctx.arc(562, 376, 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(121, 73, 52, 0.55)'
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(484, 428)
    ctx.quadraticCurveTo(512, 448, 542, 428)
    ctx.stroke()

    ctx.fillStyle = 'rgba(42, 111, 108, 1)'
    ctx.beginPath()
    ctx.moveTo(318, 326)
    ctx.quadraticCurveTo(512, 150, 706, 326)
    ctx.quadraticCurveTo(612, 276, 512, 310)
    ctx.quadraticCurveTo(412, 276, 318, 326)
    ctx.fill()

    drawRoundedRect(318, 498, 388, 116, 52, 'rgba(42, 111, 108, 1)', 'rgba(255, 232, 166, 0.55)', 8)
    drawRoundedRect(418, 580, 188, 220, 34, 'rgba(255, 248, 226, 0.95)', 'rgba(229, 159, 73, 0.58)', 6)

    ctx.strokeStyle = 'rgba(249, 211, 154, 0.96)'
    ctx.lineWidth = 34
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(368, 598)
    ctx.quadraticCurveTo(300, 660, 286, 742)
    ctx.moveTo(650, 594)
    ctx.quadraticCurveTo(742, 628, 768, 736)
    ctx.stroke()

    drawVial(286, 742, -0.22, 0.62, 'rgba(76, 176, 160, 0.84)')
    drawFormulaCard(770, 728, 0.18, 0.66)
    drawCrystal(512, 660, 44, 'rgba(244, 189, 83, 0.92)')

    drawSpark(294, 332, 32, 'rgba(244, 189, 83, 0.92)', 0.2)
    drawSpark(730, 362, 26, 'rgba(83, 183, 166, 0.86)', -0.3)
    drawSpark(642, 814, 20, 'rgba(241, 123, 91, 0.78)', 0.4)

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    return await new Promise(resolve => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result).split(',')[1])
      reader.readAsDataURL(blob)
    })
  })

  fs.mkdirSync(path.dirname(sourcePath), { recursive: true })
  fs.writeFileSync(sourcePath, Buffer.from(png, 'base64'))
  console.log(`wrote ${path.relative(repoRoot, sourcePath)}`)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 })

await page.setContent('<!doctype html><html><body></body></html>')

try {
  if (!fs.existsSync(sourcePath)) {
    await generateSourceCutout(page)
  }

  const sourceDataUrl = `data:image/png;base64,${fs.readFileSync(sourcePath).toString('base64')}`

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

      function drawRoundedRect(x, y, width, height, radius, fill, stroke, lineWidth = 5) {
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
          ctx.lineWidth = lineWidth
          ctx.stroke()
        }
      }

      function drawSpark(cx, cy, size, color, rotation = 0) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rotation)
        ctx.beginPath()
        for (let i = 0; i < 8; i += 1) {
          const radius = i % 2 === 0 ? size : size * 0.34
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

      function drawFormulaCard(cx, cy, rotation, scale, tint = 'rgba(255, 249, 236, 0.94)') {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rotation)
        ctx.scale(scale, scale)
        drawRoundedRect(-50, -66, 100, 132, 16, tint, 'rgba(180, 119, 72, 0.55)', 5)
        ctx.strokeStyle = 'rgba(42, 126, 120, 0.62)'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(-24, -20)
        ctx.lineTo(24, -20)
        ctx.moveTo(-24, 8)
        ctx.lineTo(16, 8)
        ctx.moveTo(-18, 34)
        ctx.lineTo(22, 34)
        ctx.stroke()
        ctx.fillStyle = 'rgba(229, 159, 73, 0.82)'
        ctx.beginPath()
        ctx.arc(25, -34, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      function drawVial(cx, cy, rotation, scale, liquid) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rotation)
        ctx.scale(scale, scale)
        drawRoundedRect(-20, -66, 40, 28, 9, 'rgba(226, 235, 224, 0.92)', 'rgba(69, 112, 120, 0.68)', 5)
        drawRoundedRect(-46, -38, 92, 116, 26, 'rgba(230, 248, 246, 0.42)', 'rgba(69, 112, 120, 0.62)', 5)
        ctx.fillStyle = liquid
        ctx.beginPath()
        ctx.ellipse(0, 30, 38, 32, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      function drawCrystal(cx, cy, size, color, rotation = 0) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rotation)
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(size * 0.66, -size * 0.18)
        ctx.lineTo(size * 0.42, size * 0.86)
        ctx.lineTo(-size * 0.42, size * 0.86)
        ctx.lineTo(-size * 0.66, -size * 0.18)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = 'rgba(84, 93, 98, 0.32)'
        ctx.lineWidth = Math.max(3, size * 0.08)
        ctx.stroke()
        ctx.restore()
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

      function drawEnergyRing(t, color, radiusX, radiusY, width, speed = 1) {
        ctx.save()
        ctx.translate(512, 512)
        ctx.rotate(t * Math.PI * 2 * speed)
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.beginPath()
        ctx.ellipse(0, 0, radiusX, radiusY, 0, Math.PI * 0.12, Math.PI * 1.72)
        ctx.stroke()
        ctx.restore()
      }

      function drawStageAura(t) {
        const stage = variant.stage
        const pulse = Math.sin(t * Math.PI * 2)
        const auraAlpha = stage === 1 ? 0.12 : stage === 2 ? 0.2 : stage === 3 ? 0.27 : 0.34
        const auraColor = stage <= 2
          ? 'rgba(42, 126, 120, 1)'
          : stage === 3
            ? 'rgba(229, 159, 73, 1)'
            : 'rgba(103, 91, 181, 1)'

        if (variant.state !== 'idle' || stage >= 2) {
          ctx.save()
          ctx.globalAlpha = auraAlpha
          ctx.fillStyle = auraColor
          ctx.beginPath()
          ctx.ellipse(512, 514, 292 + stage * 24, 350 + stage * 18, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }

        if (stage >= 2) {
          drawFormulaCard(226, 324 + pulse * 7, -0.28, 0.76)
          drawVial(804, 330 - pulse * 8, 0.2, 0.64, 'rgba(82, 181, 165, 0.78)')
          drawEnergyRing(t, 'rgba(42, 126, 120, 0.34)', 252, 350, 10, 0.58)
        }

        if (stage >= 3) {
          drawEnergyRing(t, 'rgba(229, 159, 73, 0.42)', 304, 388, 12, -0.72)
          drawCrystal(512, 108 + pulse * 4, 42, 'rgba(244, 189, 83, 0.9)', t * 0.8)
          drawSpark(190, 620, 26, 'rgba(82, 181, 165, 0.84)', -t)
          drawSpark(850, 630, 28, 'rgba(241, 123, 91, 0.82)', t)
        }

        if (stage >= 4) {
          drawEnergyRing(t, 'rgba(103, 91, 181, 0.42)', 340, 420, 10, 0.9)
          drawFormulaCard(196, 742 - pulse * 8, 0.18, 0.6, 'rgba(241, 236, 255, 0.92)')
          drawCrystal(836, 742 + pulse * 8, 34, 'rgba(128, 111, 201, 0.84)', -t)
        }
      }

      function drawReaction(t) {
        const pulse = Math.sin(t * Math.PI * 2)

        if (variant.state === 'correct') {
          ctx.fillStyle = 'rgba(44, 155, 118, 0.95)'
          ctx.beginPath()
          ctx.arc(790, 232, 60, 0, Math.PI * 2)
          ctx.fill()
          drawCheck(790, 232, 1)
          drawSpark(230, 234, 25, 'rgba(101, 198, 140, 0.9)', t * 1.8)
        }

        if (variant.state === 'wrong') {
          ctx.fillStyle = 'rgba(194, 91, 78, 0.95)'
          ctx.beginPath()
          ctx.arc(786, 244, 56, 0, Math.PI * 2)
          ctx.fill()
          drawCross(786, 244, 0.9)
          drawSpark(250, 290, 18, 'rgba(229, 132, 104, 0.84)', t * 2.2)
        }

        if (variant.state === 'celebrate') {
          const confetti = [
            [198, 180, 0.5, 'rgba(236, 119, 85, 0.9)'],
            [294, 132, 0.9, 'rgba(44, 155, 143, 0.9)'],
            [756, 152, 1.2, 'rgba(241, 179, 82, 0.92)'],
            [844, 278, 0.1, 'rgba(126, 104, 196, 0.82)'],
            [224, 738, 0.7, 'rgba(241, 179, 82, 0.9)'],
            [790, 778, 1.1, 'rgba(82, 181, 165, 0.84)'],
          ]
          confetti.forEach(([x, y, rotation, color], index) => {
            ctx.save()
            ctx.translate(x + Math.sin(t * Math.PI * 2 + index) * 10, y + Math.cos(t * Math.PI * 2 + index) * 8)
            ctx.rotate(rotation + t * Math.PI)
            ctx.fillStyle = color
            ctx.fillRect(-8, -18, 16, 36)
            ctx.restore()
          })
          drawSpark(176, 342, 30, 'rgba(255, 207, 91, 0.9)', t)
          drawSpark(860, 366, 25, 'rgba(44, 155, 143, 0.86)', -t)
        }

        if (variant.state === 'evolve') {
          drawEnergyRing(t, 'rgba(255, 207, 91, 0.56)', 246, 360, 12, 1)
          drawEnergyRing(t, 'rgba(44, 155, 143, 0.46)', 300, 392, 9, -0.8)
          drawEnergyRing(t, 'rgba(103, 91, 181, 0.38)', 342, 420, 9, 0.5)
          drawSpark(512, 108, 36, 'rgba(255, 218, 104, 0.94)', t * 2)
          drawSpark(816, 598, 25, 'rgba(64, 155, 143, 0.84)', -t * 2)
        }

        if (variant.state === 'idle' && variant.stage >= 3) {
          drawSpark(512, 144 + pulse * 5, 20, 'rgba(244, 189, 83, 0.52)', t)
        }
      }

      function drawCharacter(t) {
        const pulse = Math.sin(t * Math.PI * 2)
        let scale = variant.stage === 4 ? 0.82 : variant.stage === 3 ? 0.8 : variant.stage === 2 ? 0.77 : 0.75
        let x = 512
        let y = variant.stage === 4 ? 490 : variant.stage === 3 ? 496 : variant.stage === 2 ? 506 : 514
        let rotation = 0

        if (variant.state === 'correct') {
          y -= Math.max(0, pulse) * 18
          scale += 0.01 + Math.max(0, pulse) * 0.012
          rotation = Math.sin(t * Math.PI * 2) * 0.02
        } else if (variant.state === 'wrong') {
          x += Math.sin(t * Math.PI * 8) * 10
          rotation = Math.sin(t * Math.PI * 8) * 0.018
        } else if (variant.state === 'celebrate') {
          y -= 24 + Math.max(0, pulse) * 12
          scale += 0.015
          rotation = Math.sin(t * Math.PI * 2) * 0.036
        } else if (variant.state === 'evolve') {
          scale += 0.02 + Math.sin(t * Math.PI) * 0.045
          rotation = Math.sin(t * Math.PI * 2) * 0.026
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
        drawStageAura(t)
        drawReaction(t)
        drawCharacter(t)
      }

      function blobToBase64(blob) {
        return new Promise(resolve => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(String(reader.result).split(',')[1])
          reader.readAsDataURL(blob)
        })
      }

      drawFrame(0.16)
      const webpBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.92))

      const stream = canvas.captureStream(24)
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2400000,
      })
      const chunks = []
      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      const stopped = new Promise(resolve => {
        recorder.onstop = resolve
      })

      recorder.start()
      const frameCount = Math.ceil((variant.durationMs / 1000) * 24)
      for (let frame = 0; frame <= frameCount; frame += 1) {
        drawFrame(frame / frameCount)
        await new Promise(resolve => setTimeout(resolve, 1000 / 24))
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
