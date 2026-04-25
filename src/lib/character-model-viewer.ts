export interface CameraFitInput {
  width: number
  height: number
  depth: number
  verticalFovDegrees: number
  aspectRatio: number
  padding?: number
}

export function calculateCameraFitDistance({
  width,
  height,
  depth,
  verticalFovDegrees,
  aspectRatio,
  padding = 1.28,
}: CameraFitInput): number {
  const safeWidth = Math.max(width, 0.001)
  const safeHeight = Math.max(height, 0.001)
  const safeDepth = Math.max(depth, 0.001)
  const safeAspect = Math.max(aspectRatio, 0.1)
  const verticalFov = (Math.max(verticalFovDegrees, 1) * Math.PI) / 180
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * safeAspect)
  const heightDistance = (safeHeight * padding) / (2 * Math.tan(verticalFov / 2))
  const widthDistance = (safeWidth * padding) / (2 * Math.tan(horizontalFov / 2))
  const depthDistance = safeDepth * padding

  return Math.max(heightDistance, widthDistance, depthDistance)
}
