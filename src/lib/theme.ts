import { Topic } from './types'
import { hexToRgba, darkenColor } from './utils'

export interface TopicTheme {
  bg: string
  text: string
  accent: string
  border: string
  isDynamic: boolean
}

/**
 * getTopicTheme - Shared utility to calculate visual theme for a topic.
 * Follows the "Tactile Scholar" design system.
 */
export function getTopicTheme(topic: Topic): TopicTheme {
  // 1. Priority: Use color from topic setup (database)
  if (topic.color && topic.color.startsWith('#')) {
    const baseColor = topic.color;
    return {
      bg: hexToRgba(baseColor, 0.12), // 12% alpha for rich pastel
      text: darkenColor(baseColor, 0.4), // 40% darker for readable editorial text
      accent: baseColor,
      border: hexToRgba(baseColor, 0.1),
      isDynamic: true
    };
  }

  // 2. Fallback: Name-based mapping if color is missing
  const n = topic.name.toLowerCase();
  
  // Mapping patterns to semantic groupings
  if (n.includes('marketing') || n.includes('business')) 
    return { bg: '#E3F2FD', text: '#0D47A1', accent: '#2196F3', border: '#BBDEFB', isDynamic: false };
  
  if (n.includes('sustainability') || n.includes('nature') || n.includes('environment')) 
    return { bg: '#E8F5E9', text: '#1B5E20', accent: '#4CAF50', border: '#C8E6C9', isDynamic: false };
  
  if (n.includes('tech') || n.includes('software') || n.includes('ai')) 
    return { bg: '#F3E5F5', text: '#4A148C', accent: '#9C27B0', border: '#E1BEE7', isDynamic: false };
  
  if (n.includes('human resources') || n.includes('people') || n.includes('social')) 
    return { bg: '#FFF3E0', text: '#E65100', accent: '#FF9800', border: '#FFE0B2', isDynamic: false };
  
  if (n.includes('legal') || n.includes('politics') || n.includes('history')) 
    return { bg: '#ECEFF1', text: '#263238', accent: '#607D8B', border: '#CFD8DC', isDynamic: false };
  
  if (n.includes('data') || n.includes('math') || n.includes('science')) 
    return { bg: '#F0F4C3', text: '#33691E', accent: '#827717', border: '#DCE775', isDynamic: false };
  
  // Default fallback (Tactile Neutral)
  return { 
    bg: 'var(--color-surface-container-low)', 
    text: 'var(--color-on-surface-variant)', 
    accent: 'var(--color-primary)', 
    border: 'var(--color-outline-variant)',
    isDynamic: false 
  };
}
