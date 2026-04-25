import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'src', 'components', 'characters', 'CharacterModelAvatar.tsx'),
  'utf-8',
)

describe('CharacterModelAvatar interaction contract', () => {
  it('uses OrbitControls so OBJ characters can be inspected from multiple angles', () => {
    expect(source).toContain('OrbitControls')
    expect(source).toContain('enableDamping')
    expect(source).toContain('minDistance')
    expect(source).toContain('maxDistance')
  })

  it('marks the WebGL canvas as draggable/touchable viewer surface', () => {
    expect(source).toContain("style.touchAction = 'none'")
    expect(source).toContain("style.cursor = 'grab'")
  })

  it('fits the camera from model bounds instead of relying on a fixed frame', () => {
    expect(source).toContain('calculateCameraFitDistance')
    expect(source).toContain('fitCameraToModel')
    expect(source).toContain('loadedModel')
  })

  it('loads PBR texture maps only when the high quality material mode is requested', () => {
    expect(source).toContain("materialQuality = 'standard'")
    expect(source).toContain("materialQuality === 'pbr'")
    expect(source).toContain('normalMap')
    expect(source).toContain('roughnessMap')
    expect(source).toContain('metalnessMap')
  })
})
