import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import type {
  CharacterAnimationState,
  CharacterModelAsset,
  CharacterModelMaterialQuality,
} from '../../lib/character-assets'
import { calculateCameraFitDistance } from '../../lib/character-model-viewer'

interface CharacterModelAvatarProps {
  asset: CharacterModelAsset
  className: string
  animated: boolean
  animationState: CharacterAnimationState
  materialQuality?: CharacterModelMaterialQuality
  onError: () => void
  onReactionEnd?: () => void
}

const reactionDurations: Record<CharacterAnimationState, number> = {
  idle: 0,
  correct: 1100,
  wrong: 950,
  celebrate: 1400,
  evolve: 1500,
}

function supportsWebGl(): boolean {
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

function disposeObject(object: THREE.Object3D) {
  object.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return

    child.geometry.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach(material => material.dispose())
  })
}

async function loadOptionalTexture(
  loader: THREE.TextureLoader,
  src: string | undefined,
  colorSpace?: THREE.ColorSpace,
): Promise<THREE.Texture | null> {
  if (!src) return null

  const texture = await loader.loadAsync(src).catch(() => null)
  if (texture && colorSpace) texture.colorSpace = colorSpace
  return texture
}

export default function CharacterModelAvatar({
  asset,
  className,
  animated,
  animationState,
  materialQuality = 'standard',
  onError,
  onReactionEnd,
}: CharacterModelAvatarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationStateRef = useRef<CharacterAnimationState>(animationState)
  const userInteractingRef = useRef(false)

  useEffect(() => {
    animationStateRef.current = animationState
  }, [animationState])

  useEffect(() => {
    if (!animated || animationState === 'idle') return

    const timeoutId = window.setTimeout(() => {
      onReactionEnd?.()
    }, reactionDurations[animationState])

    return () => window.clearTimeout(timeoutId)
  }, [animated, animationState, onReactionEnd])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !supportsWebGl()) {
      onError()
      return
    }

    let frameId = 0
    let disposed = false
    let loadedModel: THREE.Object3D | null = null
    const loadedTextures: THREE.Texture[] = []
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
    camera.position.set(0, 0.16, 4.2)
    camera.lookAt(0, 0.04, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.domElement.className = 'h-full w-full'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.style.cursor = 'grab'
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.enableZoom = true
    controls.minDistance = 2.4
    controls.maxDistance = 6
    controls.minPolarAngle = Math.PI * 0.18
    controls.maxPolarAngle = Math.PI * 0.84
    controls.autoRotateSpeed = 0.72
    controls.target.set(0, 0.02, 0)
    controls.update()

    const handleControlStart = () => {
      userInteractingRef.current = true
      renderer.domElement.style.cursor = 'grabbing'
    }
    const handleControlEnd = () => {
      userInteractingRef.current = false
      renderer.domElement.style.cursor = 'grab'
    }

    controls.addEventListener('start', handleControlStart)
    controls.addEventListener('end', handleControlEnd)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(2.2, 2.8, 3.4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.1)
    fillLight.position.set(-2.4, 1.8, 1.8)
    scene.add(fillLight)
    scene.add(new THREE.AmbientLight(0xffffff, 1.45))

    const group = new THREE.Group()
    scene.add(group)

    const fitCameraToModel = () => {
      if (!loadedModel) return

      const bounds = new THREE.Box3().setFromObject(loadedModel)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())
      const maxDimension = Math.max(size.x, size.y, size.z, 0.1)
      const distance = calculateCameraFitDistance({
        width: size.x,
        height: size.y,
        depth: size.z,
        verticalFovDegrees: camera.fov,
        aspectRatio: camera.aspect,
        padding: 1.42,
      })
      const targetY = center.y + size.y * 0.02

      camera.position.set(center.x, targetY, center.z + distance)
      camera.near = Math.max(0.01, distance - maxDimension * 3)
      camera.far = distance + maxDimension * 4 + 20
      camera.updateProjectionMatrix()

      controls.target.set(center.x, targetY, center.z)
      controls.minDistance = Math.max(0.6, distance * 0.62)
      controls.maxDistance = Math.max(controls.minDistance + 0.2, distance * 1.9)
      controls.update()
    }

    const resize = () => {
      const width = Math.max(1, container.clientWidth || 288)
      const height = Math.max(1, container.clientHeight || 288)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      fitCameraToModel()
    }

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resize)
      : null
    resizeObserver?.observe(container)
    resize()

    async function loadModel() {
      try {
        const textureLoader = new THREE.TextureLoader()
        const diffuseTexture = await loadOptionalTexture(
          textureLoader,
          asset.diffuseTextureSrc,
          THREE.SRGBColorSpace,
        )
        const usePbrTextures = materialQuality === 'pbr'
        const normalTexture = usePbrTextures
          ? await loadOptionalTexture(textureLoader, asset.normalTextureSrc)
          : null
        const roughnessTexture = usePbrTextures
          ? await loadOptionalTexture(textureLoader, asset.roughnessTextureSrc)
          : null
        const metallicTexture = usePbrTextures
          ? await loadOptionalTexture(textureLoader, asset.metallicTextureSrc)
          : null
        const activeTextures: THREE.Texture[] = [
          diffuseTexture,
          normalTexture,
          roughnessTexture,
          metallicTexture,
        ].flatMap(texture => (texture ? [texture] : []))
        loadedTextures.push(...activeTextures)

        const model = await new OBJLoader().loadAsync(asset.modelSrc)
        if (disposed) {
          disposeObject(model)
          activeTextures.forEach(texture => texture.dispose())
          return
        }

        model.traverse(child => {
          if (!(child instanceof THREE.Mesh)) return

          child.material = new THREE.MeshStandardMaterial({
            map: diffuseTexture ?? undefined,
            normalMap: normalTexture ?? undefined,
            roughnessMap: roughnessTexture ?? undefined,
            metalnessMap: metallicTexture ?? undefined,
            roughness: roughnessTexture ? 1 : 0.62,
            metalness: metallicTexture ? 1 : 0.04,
          })
        })

        const bounds = new THREE.Box3().setFromObject(model)
        const size = bounds.getSize(new THREE.Vector3())
        const maxDimension = Math.max(size.x, size.y, size.z, 0.1)
        const stageScale = 1 + (asset.stage - 1) * 0.035
        model.scale.setScalar((2.1 / maxDimension) * stageScale)

        const normalizedBounds = new THREE.Box3().setFromObject(model)
        const center = normalizedBounds.getCenter(new THREE.Vector3())
        model.position.sub(center)

        loadedModel = model
        group.add(model)
        fitCameraToModel()
      } catch {
        onError()
      }
    }

    const clock = new THREE.Clock()
    const render = () => {
      const elapsed = clock.getElapsedTime()
      const state = animationStateRef.current
      const pulse = Math.sin(elapsed * Math.PI * 2)
      const fastPulse = Math.sin(elapsed * Math.PI * 6)

      controls.autoRotate = animated && state === 'idle' && !userInteractingRef.current
      group.rotation.y = 0
      group.position.y = animated ? pulse * 0.025 : 0
      group.scale.setScalar(1)

      if (state === 'correct') {
        group.rotation.z = Math.max(0, pulse) * 0.04
        group.position.y += Math.max(0, pulse) * 0.08
      } else if (state === 'wrong') {
        group.rotation.z = fastPulse * 0.035
        group.position.x = fastPulse * 0.035
      } else if (state === 'celebrate') {
        group.rotation.z = pulse * 0.06
        group.position.y += 0.08 + Math.max(0, pulse) * 0.08
      } else if (state === 'evolve') {
        group.rotation.y += elapsed * 0.9
        group.scale.setScalar(1 + Math.max(0, pulse) * 0.08)
      } else {
        group.rotation.z = 0
        group.position.x = 0
      }

      controls.update()
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(render)
    }

    loadModel()
    render()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      controls.removeEventListener('start', handleControlStart)
      controls.removeEventListener('end', handleControlEnd)
      controls.dispose()
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
        }
      })
      disposeObject(group)
      loadedTextures.forEach(texture => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [
    animated,
    asset.diffuseTextureSrc,
    asset.metallicTextureSrc,
    asset.modelSrc,
    asset.normalTextureSrc,
    asset.roughnessTextureSrc,
    asset.stage,
    materialQuality,
    onError,
  ])

  return (
    <div
      ref={containerRef}
      className={`${className} relative shrink-0 flex items-center justify-center`}
      data-character-avatar-model="true"
      data-character-material-quality={materialQuality}
    />
  )
}
