import { describe, expect, it } from 'vitest'
import { calculateCameraFitDistance } from '../../src/lib/character-model-viewer'

describe('character model viewer camera fitting', () => {
  it('moves the camera farther back for tall models so top and bottom stay visible', () => {
    const shortModel = calculateCameraFitDistance({
      width: 1.5,
      height: 1.5,
      depth: 0.8,
      verticalFovDegrees: 28,
      aspectRatio: 1,
    })
    const tallModel = calculateCameraFitDistance({
      width: 1.5,
      height: 2.8,
      depth: 0.8,
      verticalFovDegrees: 28,
      aspectRatio: 1,
    })

    expect(tallModel).toBeGreaterThan(shortModel)
  })

  it('uses viewport aspect ratio so wide models fit inside narrow frames', () => {
    const wideDesktop = calculateCameraFitDistance({
      width: 3,
      height: 1.6,
      depth: 0.8,
      verticalFovDegrees: 28,
      aspectRatio: 1.4,
    })
    const wideNarrow = calculateCameraFitDistance({
      width: 3,
      height: 1.6,
      depth: 0.8,
      verticalFovDegrees: 28,
      aspectRatio: 0.75,
    })

    expect(wideNarrow).toBeGreaterThan(wideDesktop)
  })
})
