import { describe, it, expect } from 'vitest'
import { speak, stop, isSpeaking } from '../../src/lib/tts'

describe('TTS Module', () => {
  it('isSpeaking returns boolean', () => {
    const result = isSpeaking()
    expect(typeof result).toBe('boolean')
  })

  it('stop does not throw', () => {
    expect(stop).not.toThrow()
  })
})
