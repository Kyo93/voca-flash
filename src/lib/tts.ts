/**
 * Text-to-Speech using Web Speech API
 * Supports standard and slow playback
 */

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string, slow = false): void {
  if (!window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported in this browser')
    return
  }

  // Cancel any ongoing speech
  stop()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = slow ? 0.6 : 0.85
  utterance.pitch = 1
  utterance.volume = 1

  // Try to find an English voice
  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find(
    (v) => v.lang.startsWith('en') && !v.name.includes('Google')
  ) || voices.find((v) => v.lang.startsWith('en'))

  if (englishVoice) {
    utterance.voice = englishVoice
  }

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function stop(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false
}

export function onVoicesChanged(callback: () => void): void {
  window.speechSynthesis?.addEventListener('voiceschanged', callback)
}
