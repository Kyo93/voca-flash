/**
 * Robust Speech Synthesis Utility for VocaFlash
 * Prevents audio doubling and bleeding between challenges.
 */

export const cancelSpeech = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const speakWord = (text: string, rate = 0.8) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // 1. Cancel any ongoing speech to clear the queue
  cancelSpeech();

  // 2. Create new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;

  // 3. Speak
  window.speechSynthesis.speak(utterance);
};
