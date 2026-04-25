import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const modelAvatarSource = fs.readFileSync(
  path.join(process.cwd(), 'src', 'components', 'characters', 'CharacterModelAvatar.tsx'),
  'utf-8',
)
const modelRuntimeSource = fs.readFileSync(
  path.join(process.cwd(), 'src', 'components', 'characters', 'character-model-avatar-runtime.ts'),
  'utf-8',
)
const modelLoaderSource = fs.readFileSync(
  path.join(process.cwd(), 'src', 'components', 'characters', 'character-model-avatar-loader.ts'),
  'utf-8',
)
const source = `${modelAvatarSource}\n${modelRuntimeSource}\n${modelLoaderSource}`

describe('CharacterModelAvatar interaction contract', () => {
  it('uses OrbitControls so OBJ characters can be inspected from multiple angles', () => {
    expect(source).toContain('OrbitControls')
    expect(source).toContain('enableDamping')
    expect(source).toContain('enableRotate = true')
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

  it('uses extra camera padding for animated GLB or skinned characters', () => {
    expect(source).toContain('animatedModelFitPadding')
    expect(source).toContain('hasSkinnedMesh')
    expect(source).toContain('modelFitPadding')
    expect(source).toContain('padding: modelFitPadding')
  })

  it('loads PBR texture maps only when the high quality material mode is requested', () => {
    expect(source).toContain("materialQuality = 'standard'")
    expect(source).toContain("materialQuality === 'pbr'")
    expect(source).toContain('normalMap')
    expect(source).toContain('roughnessMap')
    expect(source).toContain('metalnessMap')
  })

  it('uses GLTFLoader for GLB character sources while keeping OBJLoader support', () => {
    expect(source).toContain('GLTFLoader')
    expect(source).toContain("asset.modelSrc.toLowerCase().endsWith('.glb')")
    expect(source).toContain('new GLTFLoader().loadAsync(asset.modelSrc)')
    expect(source).toContain('new OBJLoader().loadAsync(asset.modelSrc)')
  })

  it('restores diffuse textures from legacy specular-glossiness GLB materials', () => {
    expect(source).toContain('KHR_materials_pbrSpecularGlossiness')
    expect(source).toContain("gltf.parser.getDependency('texture', diffuseTexture.index)")
    expect(source).toContain('restoreGlbSpecularGlossinessDiffuseTextures')
  })

  it('plays embedded GLB animation clips through an AnimationMixer', () => {
    expect(source).toContain('new THREE.AnimationMixer(model)')
    expect(source).toContain('selectGlbAnimationClip')
    expect(source).toContain('animationMixer.update(delta)')
    expect(source).toContain('clipAction(nextClip)')
  })

  it('maps common dog GLB clip names to character reaction states', () => {
    expect(source).toContain("idle: ['idle', 'standing', 'sit']")
    expect(source).toContain("correct: ['shake'")
    expect(source).toContain("wrong: ['play_dead'")
    expect(source).toContain("celebrate: ['rollover'")
  })

  it('uses a richer display preset for PBR mode so expanded characters have more depth', () => {
    expect(source).toContain('ACESFilmicToneMapping')
    expect(source).toContain('toneMappingExposure')
    expect(source).toContain('HemisphereLight')
    expect(source).toContain('RoomEnvironment')
    expect(source).toContain('scene.environment')
    expect(source).toContain('rimLight')
    expect(source).toContain('normalScale')
    expect(source).toContain('data-character-ground-shadow')
  })

  it('keeps procedural 3D reaction animations visible long enough to read', () => {
    expect(source).toContain('correct: 2400')
    expect(source).toContain('wrong: 2200')
    expect(source).toContain('celebrate: 3200')
    expect(source).toContain('evolve: 3600')
  })

  it('can disable procedural reactions so embedded GLB clips play cleanly in expanded view', () => {
    expect(source).toContain('disableProceduralAnimation = false')
    expect(source).toContain('const shouldRunProceduralAnimation = animated && !disableProceduralAnimation')
    expect(source).toContain("if (shouldRunProceduralAnimation && state === 'correct')")
  })

  it('accepts viewer exposure and light preset settings for the large 3D view', () => {
    expect(source).toContain('modelViewerSettings')
    expect(source).toContain('CharacterModelViewerSettings')
    expect(source).toContain('lightPreset')
    expect(source).toContain('toneMappingExposure = isPbrMode ? activeSettings.exposure : 1')
    expect(source).toContain('modelMaterials')
    expect(source).toContain('material.envMapIntensity = activeLightProfile.env')
  })

  it('starts the large 3D viewer with a low-brightness soft preset', () => {
    expect(source).toContain('key: 1.28')
    expect(source).toContain('fill: 0.28')
    expect(source).toContain('rim: 0.78')
    expect(source).toContain('env: 0.52')
  })

  it('caps large PBR render resolution to reduce expanded viewer lag', () => {
    expect(source).toContain("powerPreference: 'high-performance'")
    expect(source).toContain('performancePixelRatioCap')
    expect(source).toContain('renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, performancePixelRatioCap))')
  })

  it('keeps the WebGL model mounted when parent callback props refresh', () => {
    expect(source).toContain('onErrorRef')
    expect(source).toContain('onErrorRef.current = onError')
    expect(source).toContain('onErrorRef.current()')
  })

  it('shows a static thumbnail while the 3D model is still loading', () => {
    expect(source).toContain('thumbnailSrc')
    expect(source).toContain('isModelReady')
    expect(source).toContain('data-character-model-loading-thumbnail')
  })
})
