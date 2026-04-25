import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type {
  CharacterAnimationState,
  CharacterModelLightPreset,
} from '../../lib/character-assets'

export const reactionDurations: Record<CharacterAnimationState, number> = {
  idle: 0,
  correct: 2400,
  wrong: 2200,
  celebrate: 3200,
  evolve: 3600,
}

export const pbrLightProfiles: Record<CharacterModelLightPreset, {
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

export const standardModelFitPadding = 1.42
export const animatedModelFitPadding = 2.28

export interface CharacterModelLights {
  keyLight: THREE.DirectionalLight
  fillLight: THREE.DirectionalLight
  rimLight: THREE.DirectionalLight | null
  topLight: THREE.DirectionalLight | null
  hemisphereLight: THREE.HemisphereLight | null
  ambientLight: THREE.AmbientLight | null
}

export function supportsWebGl(): boolean {
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

export function createCharacterModelRenderer(
  container: HTMLDivElement,
  isPbrMode: boolean,
  exposure: number,
): THREE.WebGLRenderer {
  const performancePixelRatioCap = isPbrMode ? 1.25 : 1.75
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = isPbrMode ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping
  renderer.toneMappingExposure = isPbrMode ? exposure : 1
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, performancePixelRatioCap))
  renderer.domElement.className = 'relative z-10 h-full w-full'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.touchAction = 'none'
  renderer.domElement.style.cursor = 'grab'
  container.appendChild(renderer.domElement)

  return renderer
}

export function createCharacterModelEnvironment(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  isPbrMode: boolean,
): THREE.Texture | null {
  if (!isPbrMode) return null

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  const environmentTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environmentTexture
  pmremGenerator.dispose()

  return environmentTexture
}

export function createCharacterModelControls(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
): OrbitControls {
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

  return controls
}

export function hasSkinnedMesh(object: THREE.Object3D): boolean {
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

export function collectStandardMaterials(object: THREE.Object3D, modelMaterials: THREE.MeshStandardMaterial[]) {
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

export async function restoreGlbSpecularGlossinessDiffuseTextures(
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

export function selectGlbAnimationClip(
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

export function disposeObject(object: THREE.Object3D) {
  object.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return

    child.geometry.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach(disposeMaterial)
  })
}

export function addCharacterModelLights(
  scene: THREE.Scene,
  isPbrMode: boolean,
  lightPreset: CharacterModelLightPreset,
): CharacterModelLights {
  const defaultLightProfile = pbrLightProfiles[lightPreset]
  const keyLight = new THREE.DirectionalLight(isPbrMode ? 0xfff0d0 : 0xffffff, isPbrMode ? defaultLightProfile.key : 2.4)
  keyLight.position.set(2.2, isPbrMode ? 3.2 : 2.8, 3.4)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(isPbrMode ? 0xdce8ff : 0xffffff, isPbrMode ? defaultLightProfile.fill : 1.1)
  fillLight.position.set(-2.4, 1.8, 1.8)
  scene.add(fillLight)

  const lights: CharacterModelLights = {
    keyLight,
    fillLight,
    rimLight: null,
    topLight: null,
    hemisphereLight: null,
    ambientLight: null,
  }

  if (isPbrMode) {
    lights.rimLight = new THREE.DirectionalLight(0xbfd7ff, defaultLightProfile.rim)
    lights.rimLight.position.set(-3.2, 2.4, -3.4)
    scene.add(lights.rimLight)

    lights.topLight = new THREE.DirectionalLight(0xffffff, defaultLightProfile.top)
    lights.topLight.position.set(0, 4.2, 1.2)
    scene.add(lights.topLight)

    lights.hemisphereLight = new THREE.HemisphereLight(0xfff3d5, 0x2b221d, defaultLightProfile.hemi)
    lights.ambientLight = new THREE.AmbientLight(0xffffff, defaultLightProfile.ambient)
    scene.add(lights.hemisphereLight)
    scene.add(lights.ambientLight)
  } else {
    scene.add(new THREE.AmbientLight(0xffffff, 1.45))
  }

  return lights
}

export function applyCharacterModelLightProfile(
  lights: CharacterModelLights,
  modelMaterials: THREE.MeshStandardMaterial[],
  isPbrMode: boolean,
  lightPreset: CharacterModelLightPreset,
) {
  if (!isPbrMode) return

  const activeLightProfile = pbrLightProfiles[lightPreset]
  lights.keyLight.intensity = activeLightProfile.key
  lights.fillLight.intensity = activeLightProfile.fill
  if (lights.rimLight) lights.rimLight.intensity = activeLightProfile.rim
  if (lights.topLight) lights.topLight.intensity = activeLightProfile.top
  if (lights.hemisphereLight) lights.hemisphereLight.intensity = activeLightProfile.hemi
  if (lights.ambientLight) lights.ambientLight.intensity = activeLightProfile.ambient
  modelMaterials.forEach(material => {
    material.envMapIntensity = activeLightProfile.env
  })
}

export async function loadOptionalTexture(
  loader: THREE.TextureLoader,
  src: string | undefined,
  colorSpace?: THREE.ColorSpace,
): Promise<THREE.Texture | null> {
  if (!src) return null

  const texture = await loader.loadAsync(src).catch(() => null)
  if (texture && colorSpace) texture.colorSpace = colorSpace
  return texture
}
