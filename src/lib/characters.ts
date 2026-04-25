import type { RewardProgressView } from './rewards'

export type CharacterRarity = 'starter' | 'common' | 'rare' | 'epic'

export interface CharacterEvolutionStage {
  stage: number
  costXp: number
  nameKey: string
  descriptionKey: string
  poseLabelKey: string
  icon: string
  swatchClass: string
}

export interface CharacterDefinition {
  id: string
  costXp: number
  rarity: CharacterRarity
  nameKey: string
  descriptionKey: string
  poseLabelKey: string
  icon: string
  swatchClass: string
  evolutionStages: CharacterEvolutionStage[]
}

export interface CharacterUnlockState {
  characterId: string
  currentStage: number
  evolutionSpentXp: number
}

export interface CharacterCollectionItem {
  character: CharacterDefinition
  currentStage: number
  currentStageDefinition: CharacterEvolutionStage
  nextStageDefinition: CharacterEvolutionStage | null
  unlocked: boolean
  affordable: boolean
  selected: boolean
  canEvolve: boolean
  maxed: boolean
  remainingXpForEvolution: number
}

export interface CharacterCollectionView {
  totalXp: number
  spentXp: number
  availableXp: number
  selectedCharacter: CharacterDefinition | null
  items: CharacterCollectionItem[]
}

export const DEFAULT_CHARACTER_ID = 'seedling_scholar'

function stage(
  characterId: string,
  stageNumber: number,
  costXp: number,
  icon: string,
  swatchClass: string,
): CharacterEvolutionStage {
  return {
    stage: stageNumber,
    costXp,
    nameKey: `characters.items.${characterId}.stages.${stageNumber}.name`,
    descriptionKey: `characters.items.${characterId}.stages.${stageNumber}.description`,
    poseLabelKey: `characters.items.${characterId}.stages.${stageNumber}.pose`,
    icon,
    swatchClass,
  }
}

export const CHARACTER_CATALOG: CharacterDefinition[] = [
  {
    id: DEFAULT_CHARACTER_ID,
    costXp: 0,
    rarity: 'starter',
    nameKey: 'characters.items.seedling_scholar.name',
    descriptionKey: 'characters.items.seedling_scholar.description',
    poseLabelKey: 'characters.items.seedling_scholar.pose',
    icon: 'school',
    swatchClass: 'from-secondary-container to-secondary',
    evolutionStages: [
      stage(DEFAULT_CHARACTER_ID, 1, 0, 'school', 'from-secondary-container to-secondary'),
      stage(DEFAULT_CHARACTER_ID, 2, 0, 'menu_book', 'from-secondary to-secondary-stable'),
      stage(DEFAULT_CHARACTER_ID, 3, 0, 'auto_stories', 'from-primary-container to-secondary'),
    ],
  },
  {
    id: 'library_sprite',
    costXp: 0,
    rarity: 'common',
    nameKey: 'characters.items.library_sprite.name',
    descriptionKey: 'characters.items.library_sprite.description',
    poseLabelKey: 'characters.items.library_sprite.pose',
    icon: 'local_library',
    swatchClass: 'from-primary-container to-primary',
    evolutionStages: [
      stage('library_sprite', 1, 0, 'local_library', 'from-primary-container to-primary'),
      stage('library_sprite', 2, 0, 'history_edu', 'from-primary to-primary-dim'),
      stage('library_sprite', 3, 0, 'auto_stories', 'from-secondary-container to-primary'),
    ],
  },
  {
    id: 'arena_guardian',
    costXp: 0,
    rarity: 'common',
    nameKey: 'characters.items.arena_guardian.name',
    descriptionKey: 'characters.items.arena_guardian.description',
    poseLabelKey: 'characters.items.arena_guardian.pose',
    icon: 'shield',
    swatchClass: 'from-warm-accent-container to-warm-accent',
    evolutionStages: [
      stage('arena_guardian', 1, 0, 'shield', 'from-warm-accent-container to-warm-accent'),
      stage('arena_guardian', 2, 0, 'security', 'from-warm-accent to-primary'),
      stage('arena_guardian', 3, 0, 'verified_user', 'from-primary to-warm-accent'),
    ],
  },
  {
    id: 'memory_archivist',
    costXp: 0,
    rarity: 'rare',
    nameKey: 'characters.items.memory_archivist.name',
    descriptionKey: 'characters.items.memory_archivist.description',
    poseLabelKey: 'characters.items.memory_archivist.pose',
    icon: 'auto_stories',
    swatchClass: 'from-secondary to-secondary-stable',
    evolutionStages: [
      stage('memory_archivist', 1, 0, 'auto_stories', 'from-secondary to-secondary-stable'),
      stage('memory_archivist', 2, 0, 'inventory_2', 'from-secondary-container to-secondary'),
      stage('memory_archivist', 3, 0, 'psychology_alt', 'from-primary-container to-secondary'),
      stage('memory_archivist', 4, 0, 'workspace_premium', 'from-warm-accent to-secondary'),
    ],
  },
  {
    id: 'quiz_alchemist',
    costXp: 0,
    rarity: 'rare',
    nameKey: 'characters.items.quiz_alchemist.name',
    descriptionKey: 'characters.items.quiz_alchemist.description',
    poseLabelKey: 'characters.items.quiz_alchemist.pose',
    icon: 'science',
    swatchClass: 'from-primary-container to-warm-accent',
    evolutionStages: [
      stage('quiz_alchemist', 1, 0, 'science', 'from-primary-container to-warm-accent'),
      stage('quiz_alchemist', 2, 0, 'biotech', 'from-secondary-container to-primary'),
      stage('quiz_alchemist', 3, 0, 'psychology_alt', 'from-primary to-warm-accent'),
      stage('quiz_alchemist', 4, 0, 'auto_awesome', 'from-warm-accent to-secondary'),
    ],
  },
  {
    id: 'sunlit_scholar',
    costXp: 0,
    rarity: 'rare',
    nameKey: 'characters.items.sunlit_scholar.name',
    descriptionKey: 'characters.items.sunlit_scholar.description',
    poseLabelKey: 'characters.items.sunlit_scholar.pose',
    icon: 'wb_sunny',
    swatchClass: 'from-warm-accent-container to-primary',
    evolutionStages: [
      stage('sunlit_scholar', 1, 0, 'wb_sunny', 'from-warm-accent-container to-warm-accent'),
      stage('sunlit_scholar', 2, 0, 'lightbulb', 'from-warm-accent to-primary'),
      stage('sunlit_scholar', 3, 0, 'psychology_alt', 'from-primary to-secondary'),
      stage('sunlit_scholar', 4, 0, 'auto_awesome', 'from-secondary to-warm-accent'),
    ],
  },
  {
    id: 'arcane_brawler',
    costXp: 0,
    rarity: 'rare',
    nameKey: 'characters.items.arcane_brawler.name',
    descriptionKey: 'characters.items.arcane_brawler.description',
    poseLabelKey: 'characters.items.arcane_brawler.pose',
    icon: 'sports_martial_arts',
    swatchClass: 'from-warm-accent to-secondary',
    evolutionStages: [
      stage('arcane_brawler', 1, 0, 'sports_martial_arts', 'from-warm-accent to-secondary'),
      stage('arcane_brawler', 2, 0, 'bolt', 'from-warm-accent to-primary'),
      stage('arcane_brawler', 3, 0, 'psychology_alt', 'from-secondary to-warm-accent'),
      stage('arcane_brawler', 4, 0, 'auto_awesome', 'from-primary to-warm-accent'),
    ],
  },
  {
    id: 'focus_monk',
    costXp: 0,
    rarity: 'rare',
    nameKey: 'characters.items.focus_monk.name',
    descriptionKey: 'characters.items.focus_monk.description',
    poseLabelKey: 'characters.items.focus_monk.pose',
    icon: 'self_improvement',
    swatchClass: 'from-primary to-primary-dim',
    evolutionStages: [
      stage('focus_monk', 1, 0, 'self_improvement', 'from-primary to-primary-dim'),
      stage('focus_monk', 2, 0, 'spa', 'from-primary-container to-primary'),
      stage('focus_monk', 3, 0, 'psychology', 'from-secondary-container to-primary'),
      stage('focus_monk', 4, 0, 'emoji_events', 'from-primary to-warm-accent'),
    ],
  },
  {
    id: 'lexical_sage',
    costXp: 0,
    rarity: 'epic',
    nameKey: 'characters.items.lexical_sage.name',
    descriptionKey: 'characters.items.lexical_sage.description',
    poseLabelKey: 'characters.items.lexical_sage.pose',
    icon: 'workspace_premium',
    swatchClass: 'from-warm-accent to-primary',
    evolutionStages: [
      stage('lexical_sage', 1, 0, 'workspace_premium', 'from-warm-accent to-primary'),
      stage('lexical_sage', 2, 0, 'stars', 'from-primary to-warm-accent'),
      stage('lexical_sage', 3, 0, 'military_tech', 'from-secondary to-primary'),
      stage('lexical_sage', 4, 0, 'auto_awesome', 'from-warm-accent to-secondary'),
    ],
  },
];

export function getCharacterById(characterId: string | null | undefined): CharacterDefinition | null {
  if (!characterId) return null
  return CHARACTER_CATALOG.find(character => character.id === characterId) ?? null
}

export function getDefaultCharacter(): CharacterDefinition {
  return CHARACTER_CATALOG.find(character => character.id === DEFAULT_CHARACTER_ID) ?? CHARACTER_CATALOG[0]
}

export function getCharacterStage(
  character: CharacterDefinition | null | undefined,
  stageNumber: number | null | undefined
): CharacterEvolutionStage | null {
  if (!character) return null
  const normalizedStage = Math.max(1, Math.floor(stageNumber ?? 1))
  return character.evolutionStages.find(stageItem => stageItem.stage === normalizedStage)
    ?? character.evolutionStages[character.evolutionStages.length - 1]
    ?? null
}

export function getNextCharacterStage(
  character: CharacterDefinition | null | undefined,
  currentStage: number | null | undefined
): CharacterEvolutionStage | null {
  if (!character) return null
  const normalizedStage = Math.max(1, Math.floor(currentStage ?? 1))
  return character.evolutionStages.find(stageItem => stageItem.stage === normalizedStage + 1) ?? null
}

export function buildCharacterCollection({
  rewardProgress,
  unlockedCharacterIds,
  unlockedCharacterStates = [],
  selectedCharacterId,
}: {
  rewardProgress: RewardProgressView
  unlockedCharacterIds: string[]
  unlockedCharacterStates?: CharacterUnlockState[]
  selectedCharacterId?: string | null
}): CharacterCollectionView {
  const unlockedSet = new Set([DEFAULT_CHARACTER_ID, ...unlockedCharacterIds])
  const stateById = new Map(unlockedCharacterStates.map(state => [state.characterId, state]))
  const availableXp = rewardProgress.availableXp
  const selectedCharacter = getCharacterById(selectedCharacterId)
  const fallbackCharacter = getDefaultCharacter()
  const selected = selectedCharacter && unlockedSet.has(selectedCharacter.id)
    ? selectedCharacter
    : fallbackCharacter

  const items = CHARACTER_CATALOG.map(character => {
    const unlocked = unlockedSet.has(character.id)
    const unlockState = stateById.get(character.id)
    const currentStage = unlocked ? Math.max(1, Math.floor(unlockState?.currentStage ?? 1)) : 1
    const currentStageDefinition = getCharacterStage(character, currentStage) ?? character.evolutionStages[0]
    const nextStageDefinition = unlocked ? getNextCharacterStage(character, currentStageDefinition.stage) : null
    const remainingXpForEvolution = nextStageDefinition
      ? Math.max(0, nextStageDefinition.costXp - availableXp)
      : 0

    return {
      character,
      currentStage: currentStageDefinition.stage,
      currentStageDefinition,
      nextStageDefinition,
      unlocked,
      affordable: !unlocked && availableXp >= character.costXp,
      selected: character.id === selected.id,
      canEvolve: unlocked && !!nextStageDefinition && availableXp >= nextStageDefinition.costXp,
      maxed: unlocked && !nextStageDefinition,
      remainingXpForEvolution,
    }
  })

  return {
    totalXp: rewardProgress.totalXp,
    spentXp: rewardProgress.spentXp,
    availableXp,
    selectedCharacter: selected,
    items,
  }
}
