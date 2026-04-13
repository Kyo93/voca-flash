
let ttsConfig = {
  voiceURI: null as string | null,
  rate: 0.85
}

export function setTtsConfig(voiceURI: string | null, rate: number) {
  ttsConfig.voiceURI = voiceURI
  ttsConfig.rate = rate
}

export function speak(text: string, slow = false): void {
  if (!window.speechSynthesis) {
    console.warn('SpeechSynthesis not supported in this browser')
    return
  }

  // Cancel any ongoing speech
  stop()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  
  // Defensive check for rate
  const rawRate = slow ? (ttsConfig.rate * 0.7) : ttsConfig.rate
  utterance.rate = isNaN(rawRate) || rawRate <= 0 ? 0.85 : rawRate
  
  utterance.pitch = 1
  utterance.volume = 1

  const voices = window.speechSynthesis.getVoices()
  
  let selectedVoice = null
  
  if (ttsConfig.voiceURI) {
    selectedVoice = voices.find(v => v.voiceURI === ttsConfig.voiceURI)
  }
  
  if (!selectedVoice) {
    // Try to find an English voice
    selectedVoice = voices.find(
      (v) => v.lang.startsWith('en') && !v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'))
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice
  }

  window.speechSynthesis.speak(utterance)
}

export function stop(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export const cancelSpeech = stop
export const speakWord = (text: string, _rate?: number) => speak(text, false)

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false
}

export function onVoicesChanged(callback: () => void): void {
  window.speechSynthesis?.addEventListener('voiceschanged', callback)
}
