import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import type {
  CharacterModelAsset,
  CharacterModelLightPreset,
  CharacterModelMaterialQuality,
} from '../../lib/character-assets'
import {
  animatedModelFitPadding,
  collectStandardMaterials,
  hasSkinnedMesh,
  loadOptionalTexture,
  pbrLightProfiles,
  restoreGlbSpecularGlossinessDiffuseTextures,
  standardModelFitPadding,
} from './character-model-avatar-runtime'

export interface LoadedCharacterModelAsset {
  model: THREE.Object3D
  activeTextures: THREE.Texture[]
  animationClips: THREE.AnimationClip[]
  modelFitPadding: number
}

export async function loadCharacterModelAsset({
  asset,
  animated,
  materialQuality,
  lightPreset,
  modelMaterials,
  loadedTextures,
}: {
  asset: CharacterModelAsset
  animated: boolean
  materialQuality: CharacterModelMaterialQuality
  lightPreset: CharacterModelLightPreset
  modelMaterials: THREE.MeshStandardMaterial[]
  loadedTextures: THREE.Texture[]
}): Promise<LoadedCharacterModelAsset> {
  const isGlbModel = asset.modelSrc.toLowerCase().endsWith('.glb')
  const activeTextures: THREE.Texture[] = []
  let model: THREE.Object3D
  let animationClips: THREE.AnimationClip[] = []
  let modelFitPadding = standardModelFitPadding

  if (isGlbModel) {
    const gltf = await new GLTFLoader().loadAsync(asset.modelSrc)
    model = gltf.scene
    collectStandardMaterials(model, modelMaterials)
    await restoreGlbSpecularGlossinessDiffuseTextures(gltf, modelMaterials, loadedTextures)
    if (gltf.animations.length > 0 || hasSkinnedMesh(model)) {
      modelFitPadding = animatedModelFitPadding
    }
    if (animated && gltf.animations.length > 0) {
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
        envMapIntensity: usePbrTextures ? pbrLightProfiles[lightPreset].env : 1,
      })
      child.material = material
      modelMaterials.push(material)
    })
  }

  return {
    model,
    activeTextures,
    animationClips,
    modelFitPadding,
  }
}
