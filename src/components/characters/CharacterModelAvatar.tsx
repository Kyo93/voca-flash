import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import type {
  CharacterAnimationState,
  CharacterModelAsset,
  CharacterModelLightPreset,
  CharacterModelMaterialQuality,
  CharacterModelViewerSettings,
} from '../../lib/character-assets'
import {
  DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS,
  normalizeCharacterModelViewerSettings,
} from '../../lib/character-assets'
import { calculateCameraFitDistance } from '../../lib/character-model-viewer'

interface CharacterModelAvatarProps {
  asset: CharacterModelAsset
  className: string
  animated: boolean
  animationState: CharacterAnimationState
  disableProceduralAnimation?: boolean
  materialQuality?: CharacterModelMaterialQuality
  modelViewerSettings?: CharacterModelViewerSettings
  onError: () => void
  onReactionEnd?: () => void
}

const reactionDurations: Record<CharacterAnimationState, number> = {
  idle: 0,
  correct: 2400,
  wrong: 2200,
  celebrate: 3200,
  evolve: 3600,
}

const pbrLightProfiles: Record<CharacterModelLightPreset, {
  key: number
  fill: number
  rim: number
  top: number
  hemi: number
  ambient: number
  env: number
}> = {
  soft: {
    key: 1.28,
    fill: 0.28,
    rim: 0.78,
    top: 0.24,
    hemi: 0.42,
    ambient: 0.1,
    env: 0.52,
  },
  studio: {
    key: 2.45,
    fill: 0.64,
    rim: 1.85,
    top: 0.58,
    hemi: 0.86,
    ambient: 0.26,
    env: 1,
  },
  vivid: {
    key: 3.05,
    fill: 0.82,
    rim: 2.45,
    top: 0.82,
    hemi: 1.05,
    ambient: 0.34,
    env: 1.18,
  },
}

const standardModelFitPadding = 1.42
const animatedModelFitPadding = 2.28

function supportsWebGl(): boolean {
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

function hasSkinnedMesh(object: THREE.Object3D): boolean {
  let found = false
  object.traverse(child => {
    if (child instanceof THREE.SkinnedMesh) {
      found = true
    }
  })
  return found
}

function disposeMaterial(material: THREE.Material) {
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture) {
      value.dispose()
    }
  }
  material.dispose()
}

function collectStandardMaterials(object: THREE.Object3D, modelMaterials: THREE.MeshStandardMaterial[]) {
  object.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return

    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach(material => {
      if (material instanceof THREE.MeshStandardMaterial) {
        modelMaterials.push(material)
      }
    })
  })
}

async function restoreGlbSpecularGlossinessDiffuseTextures(
  gltf: GLTF,
  modelMaterials: THREE.MeshStandardMaterial[],
  loadedTextures: THREE.Texture[],
) {
  await Promise.all(modelMaterials.map(async material => {
    const materialIndex = gltf.parser.associations.get(material)?.materials
    const materialDefinition = typeof materialIndex === 'number'
      ? gltf.parser.json.materials?.[materialIndex]
      : null
    const specularGlossiness = materialDefinition?.extensions?.KHR_materials_pbrSpecularGlossiness
    const diffuseTexture = specularGlossiness?.diffuseTexture

    if (!diffuseTexture || material.map) return

    const texture = await gltf.parser.getDependency('texture', diffuseTexture.index) as THREE.Texture
    texture.colorSpace = THREE.SRGBColorSpace
    material.map = texture
    loadedTextures.push(texture)

    const diffuseFactor = specularGlossiness.diffuseFactor
    if (Array.isArray(diffuseFactor) && diffuseFactor.length >= 3) {
      material.color.setRGB(diffuseFactor[0], diffuseFactor[1], diffuseFactor[2])
      material.opacity = typeof diffuseFactor[3] === 'number' ? diffuseFactor[3] : material.opacity
    }

    if (materialDefinition?.alphaMode === 'MASK') {
      material.alphaTest = materialDefinition.alphaCutoff ?? 0.5
    } else if (materialDefinition?.alphaMode === 'BLEND') {
      material.transparent = true
    }

    if (materialDefinition?.doubleSided) {
      material.side = THREE.DoubleSide
    }

    material.needsUpdate = true
  }))
}

function selectGlbAnimationClip(
  clips: THREE.AnimationClip[],
  state: CharacterAnimationState,
): THREE.AnimationClip | null {
  const preferredClipNames: Record<CharacterAnimationState, string[]> = {
    idle: ['idle', 'standing', 'sit'],
    correct: ['shake', 'bite', 'attack', 'roar', 'idle', 'standing'],
    wrong: ['play_dead', 'attack_tail', 'tail', 'roar', 'idle', 'standing'],
    celebrate: ['rollover', 'roar', 'run', 'shake', 'idle', 'standing'],
    evolve: ['run', 'standing', 'roar', 'idle'],
  }

  for (const namePart of preferredClipNames[state]) {
    const clip = clips.find(item => item.name.toLowerCase().includes(namePart))
    if (clip) return clip
  }

  return clips[0] ?? null
}

function disposeObject(object: THREE.Object3D) {
  object.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return

    child.geometry.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach(disposeMaterial)
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
  disableProceduralAnimation = false,
  materialQuality = 'standard',
  modelViewerSettings,
  onError,
  onReactionEnd,
}: CharacterModelAvatarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationStateRef = useRef<CharacterAnimationState>(animationState)
  const modelViewerSettingsRef = useRef<CharacterModelViewerSettings>(DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS)
  const userInteractingRef = useRef(false)

  useEffect(() => {
    animationStateRef.current = animationState
  }, [animationState])

  useEffect(() => {
    modelViewerSettingsRef.current = normalizeCharacterModelViewerSettings(modelViewerSettings)
  }, [modelViewerSettings?.exposure, modelViewerSettings?.lightPreset])

  useEffect(() => {
    if (!animated || disableProceduralAnimation || animationState === 'idle') return

    const timeoutId = window.setTimeout(() => {
      onReactionEnd?.()
    }, reactionDurations[animationState])

    return () => window.clearTimeout(timeoutId)
  }, [animated, animationState, disableProceduralAnimation, onReactionEnd])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !supportsWebGl()) {
      onError()
      return
    }

    let frameId = 0
    let disposed = false
    let loadedModel: THREE.Object3D | null = null
    let environmentTexture: THREE.Texture | null = null
    let animationMixer: THREE.AnimationMixer | null = null
    let animationClips: THREE.AnimationClip[] = []
    let activeClipAction: THREE.AnimationAction | null = null
    let activeClipState: CharacterAnimationState | null = null
    let modelFitPadding = standardModelFitPadding
    const loadedTextures: THREE.Texture[] = []
    const modelMaterials: THREE.MeshStandardMaterial[] = []
    const isPbrMode = materialQuality === 'pbr'
    const performancePixelRatioCap = isPbrMode ? 1.25 : 1.75
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
    camera.position.set(0, 0.16, 4.2)
    camera.lookAt(0, 0.04, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = isPbrMode ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping
    renderer.toneMappingExposure = isPbrMode ? modelViewerSettingsRef.current.exposure : 1
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, performancePixelRatioCap))
    renderer.domElement.className = 'relative z-10 h-full w-full'
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.style.cursor = 'grab'
    container.appendChild(renderer.domElement)

    if (isPbrMode) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer)
      environmentTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
      scene.environment = environmentTexture
      pmremGenerator.dispose()
    }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableRotate = true
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

    const defaultLightProfile = pbrLightProfiles[modelViewerSettingsRef.current.lightPreset]
    const keyLight = new THREE.DirectionalLight(isPbrMode ? 0xfff0d0 : 0xffffff, isPbrMode ? defaultLightProfile.key : 2.4)
    keyLight.position.set(2.2, isPbrMode ? 3.2 : 2.8, 3.4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(isPbrMode ? 0xdce8ff : 0xffffff, isPbrMode ? defaultLightProfile.fill : 1.1)
    fillLight.position.set(-2.4, 1.8, 1.8)
    scene.add(fillLight)

    let rimLight: THREE.DirectionalLight | null = null
    let topLight: THREE.DirectionalLight | null = null
    let hemisphereLight: THREE.HemisphereLight | null = null
    let ambientLight: THREE.AmbientLight | null = null

    if (isPbrMode) {
      rimLight = new THREE.DirectionalLight(0xbfd7ff, defaultLightProfile.rim)
      rimLight.position.set(-3.2, 2.4, -3.4)
      scene.add(rimLight)

      topLight = new THREE.DirectionalLight(0xffffff, defaultLightProfile.top)
      topLight.position.set(0, 4.2, 1.2)
      scene.add(topLight)

      hemisphereLight = new THREE.HemisphereLight(0xfff3d5, 0x2b221d, defaultLightProfile.hemi)
      ambientLight = new THREE.AmbientLight(0xffffff, defaultLightProfile.ambient)
      scene.add(hemisphereLight)
      scene.add(ambientLight)
    } else {
      scene.add(new THREE.AmbientLight(0xffffff, 1.45))
    }

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
        padding: modelFitPadding,
      })
      const targetY = center.y + size.y * 0.02

      camera.position.set(center.x, targetY, center.z + distance)
      camera.near = Math.max(0.01, distance - maxDimension * 3)
      camera.far = distance + maxDimension * 4 + 20
      camera.updateProjectionMatrix()

      controls.target.set(center.x, targetY, center.z)
      controls.minDistance = Math.max(0.6, distance * 0.62)
      controls.maxDistance = Math.max(controls.minDistance + 0.2, distance * Math.max(1.9, modelFitPadding * 1.4))
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

    const playGlbAnimationClip = (state: CharacterAnimationState) => {
      if (!animated || !animationMixer || animationClips.length === 0 || activeClipState === state) return

      const nextClip = selectGlbAnimationClip(animationClips, state)
      if (!nextClip) return

      const nextAction = animationMixer.clipAction(nextClip)
      nextAction.reset()
      nextAction.enabled = true
      nextAction.setLoop(THREE.LoopRepeat, Infinity)

      if (activeClipAction) {
        activeClipAction.fadeOut(0.18)
        nextAction.fadeIn(0.18).play()
      } else {
        nextAction.play()
      }

      activeClipAction = nextAction
      activeClipState = state
    }

    async function loadModel() {
      try {
        const isGlbModel = asset.modelSrc.toLowerCase().endsWith('.glb')
        const activeTextures: THREE.Texture[] = []
        let model: THREE.Object3D

        if (isGlbModel) {
          const gltf = await new GLTFLoader().loadAsync(asset.modelSrc)
          model = gltf.scene
          collectStandardMaterials(model, modelMaterials)
          await restoreGlbSpecularGlossinessDiffuseTextures(gltf, modelMaterials, loadedTextures)
          if (gltf.animations.length > 0 || hasSkinnedMesh(model)) {
            modelFitPadding = animatedModelFitPadding
          }
          if (animated && gltf.animations.length > 0) {
            animationMixer = new THREE.AnimationMixer(model)
            animationClips = gltf.animations
          }
        } else {
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
          activeTextures.push(...[
            diffuseTexture,
            normalTexture,
            roughnessTexture,
            metallicTexture,
          ].flatMap(texture => (texture ? [texture] : [])))
          loadedTextures.push(...activeTextures)

          model = await new OBJLoader().loadAsync(asset.modelSrc)

          model.traverse(child => {
            if (!(child instanceof THREE.Mesh)) return

            const material = new THREE.MeshStandardMaterial({
              map: diffuseTexture ?? undefined,
              normalMap: normalTexture ?? undefined,
              normalScale: normalTexture ? new THREE.Vector2(0.72, 0.72) : undefined,
              roughnessMap: roughnessTexture ?? undefined,
              metalnessMap: metallicTexture ?? undefined,
              roughness: roughnessTexture ? 0.86 : 0.62,
              metalness: metallicTexture ? 0.82 : 0.04,
              envMapIntensity: usePbrTextures ? pbrLightProfiles[modelViewerSettingsRef.current.lightPreset].env : 1,
            })
            child.material = material
            modelMaterials.push(material)
          })
        }

        if (disposed) {
          disposeObject(model)
          activeTextures.forEach(texture => texture.dispose())
          return
        }

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
      const delta = clock.getDelta()
      const elapsed = clock.elapsedTime
      const state = animationStateRef.current
      const activeSettings = modelViewerSettingsRef.current
      const activeLightProfile = pbrLightProfiles[activeSettings.lightPreset]
      const pulse = Math.sin(elapsed * Math.PI * 2)
      const fastPulse = Math.sin(elapsed * Math.PI * 6)
      const shouldRunProceduralAnimation = animated && !disableProceduralAnimation

      playGlbAnimationClip(state)
      if (animationMixer) {
        animationMixer.update(delta)
      }

      renderer.toneMappingExposure = isPbrMode ? activeSettings.exposure : 1
      if (isPbrMode) {
        keyLight.intensity = activeLightProfile.key
        fillLight.intensity = activeLightProfile.fill
        if (rimLight) rimLight.intensity = activeLightProfile.rim
        if (topLight) topLight.intensity = activeLightProfile.top
        if (hemisphereLight) hemisphereLight.intensity = activeLightProfile.hemi
        if (ambientLight) ambientLight.intensity = activeLightProfile.ambient
        modelMaterials.forEach(material => {
          material.envMapIntensity = activeLightProfile.env
        })
      }

      controls.autoRotate = animated && state === 'idle' && !userInteractingRef.current
      group.rotation.y = 0
      group.position.y = shouldRunProceduralAnimation ? pulse * 0.025 : 0
      group.scale.setScalar(1)

      if (shouldRunProceduralAnimation && state === 'correct') {
        group.rotation.z = Math.max(0, pulse) * 0.04
        group.position.y += Math.max(0, pulse) * 0.08
      } else if (shouldRunProceduralAnimation && state === 'wrong') {
        group.rotation.z = fastPulse * 0.035
        group.position.x = fastPulse * 0.035
      } else if (shouldRunProceduralAnimation && state === 'celebrate') {
        group.rotation.z = pulse * 0.06
        group.position.y += 0.08 + Math.max(0, pulse) * 0.08
      } else if (shouldRunProceduralAnimation && state === 'evolve') {
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
      animationMixer?.stopAllAction()
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
        }
      })
      disposeObject(group)
      loadedTextures.forEach(texture => texture.dispose())
      environmentTexture?.dispose()
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
    disableProceduralAnimation,
    materialQuality,
    onError,
  ])

  return (
    <div
      ref={containerRef}
      className={`${className} relative shrink-0 flex items-center justify-center`}
      data-character-avatar-model="true"
      data-character-material-quality={materialQuality}
    >
      {materialQuality === 'pbr' && (
        <div
          className="pointer-events-none absolute inset-x-[18%] bottom-[7%] z-0 h-[14%] rounded-full bg-black/35 blur-3xl"
          data-character-ground-shadow="true"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
