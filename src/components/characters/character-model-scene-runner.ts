import type { RefObject } from 'react'
import * as THREE from 'three'
import type {
  CharacterAnimationState,
  CharacterModelAsset,
  CharacterModelMaterialQuality,
  CharacterModelViewerSettings,
} from '../../lib/character-assets'
import { calculateCameraFitDistance } from '../../lib/character-model-viewer'
import { loadCharacterModelAsset } from './character-model-avatar-loader'
import {
  addCharacterModelLights,
  applyCharacterModelLightProfile,
  applyCharacterModelProceduralAnimation,
  createCharacterModelControls,
  createCharacterModelEnvironment,
  createCharacterModelRenderer,
  disposeObject,
  selectGlbAnimationClip,
  standardModelFitPadding,
  supportsWebGl,
} from './character-model-avatar-runtime'

interface StartCharacterModelSceneArgs {
  animated: boolean
  animationStateRef: RefObject<CharacterAnimationState>
  asset: CharacterModelAsset
  container: HTMLDivElement
  disableProceduralAnimation: boolean
  materialQuality: CharacterModelMaterialQuality
  modelViewerSettingsRef: RefObject<CharacterModelViewerSettings>
  onErrorRef: RefObject<() => void>
  setIsModelReady: (next: boolean) => void
  userInteractingRef: RefObject<boolean>
}

export function startCharacterModelScene({
  animated,
  animationStateRef,
  asset,
  container,
  disableProceduralAnimation,
  materialQuality,
  modelViewerSettingsRef,
  onErrorRef,
  setIsModelReady,
  userInteractingRef,
}: StartCharacterModelSceneArgs): () => void {
  if (!supportsWebGl()) {
    onErrorRef.current()
    return () => undefined
  }

  let frameId = 0
  let disposed = false
  let loadedModel: THREE.Object3D | null = null
  let animationMixer: THREE.AnimationMixer | null = null
  let animationClips: THREE.AnimationClip[] = []
  let activeClipAction: THREE.AnimationAction | null = null
  let activeClipState: CharacterAnimationState | null = null
  let modelFitPadding = standardModelFitPadding
  const loadedTextures: THREE.Texture[] = []
  const modelMaterials: THREE.MeshStandardMaterial[] = []
  const isPbrMode = materialQuality === 'pbr'
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
  camera.position.set(0, 0.16, 4.2)
  camera.lookAt(0, 0.04, 0)

  const renderer = createCharacterModelRenderer(container, isPbrMode, modelViewerSettingsRef.current.exposure)
  const environmentTexture = createCharacterModelEnvironment(scene, renderer, isPbrMode)
  const controls = createCharacterModelControls(camera, renderer)

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

  const lights = addCharacterModelLights(scene, isPbrMode, modelViewerSettingsRef.current.lightPreset)

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

  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
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
      const modelAsset = await loadCharacterModelAsset({
        asset,
        animated,
        materialQuality,
        lightPreset: modelViewerSettingsRef.current.lightPreset,
        modelMaterials,
        loadedTextures,
      })
      const { model, activeTextures } = modelAsset
      modelFitPadding = modelAsset.modelFitPadding
      if (animated && modelAsset.animationClips.length > 0) {
        animationMixer = new THREE.AnimationMixer(model)
        animationClips = modelAsset.animationClips
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
      setIsModelReady(true)
    } catch {
      onErrorRef.current()
    }
  }

  const clock = new THREE.Clock()
  const render = () => {
    const delta = clock.getDelta()
    const elapsed = clock.elapsedTime
    const state = animationStateRef.current
    const activeSettings = modelViewerSettingsRef.current

    playGlbAnimationClip(state)
    if (animationMixer) {
      animationMixer.update(delta)
    }

    renderer.toneMappingExposure = isPbrMode ? activeSettings.exposure : 1
    applyCharacterModelLightProfile(lights, modelMaterials, isPbrMode, activeSettings.lightPreset)

    controls.autoRotate = animated && state === 'idle' && !userInteractingRef.current
    applyCharacterModelProceduralAnimation({
      group,
      elapsed,
      state,
      animated,
      disableProceduralAnimation,
    })

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
}
