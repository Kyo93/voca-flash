import { describe, it, expect } from 'vitest'
import { mapTestResultToRating } from '../../src/lib/srs'

describe('mapTestResultToRating', () => {
  it('sai (isCorrect=false) → rating 1', () => {
    expect(mapTestResultToRating(false, 0)).toBe(1)
    expect(mapTestResultToRating(false, 5000)).toBe(1)
    expect(mapTestResultToRating(false, 60000)).toBe(1)
  })

  it('đúng + nhanh (<3000ms) → rating 4', () => {
    expect(mapTestResultToRating(true, 0)).toBe(4)
    expect(mapTestResultToRating(true, 1500)).toBe(4)
    expect(mapTestResultToRating(true, 2999)).toBe(4)
  })

  it('đúng + vừa (3000–8000ms) → rating 3', () => {
    expect(mapTestResultToRating(true, 3000)).toBe(3)
    expect(mapTestResultToRating(true, 5000)).toBe(3)
    expect(mapTestResultToRating(true, 7999)).toBe(3)
  })

  it('đúng + chậm (≥8000ms) → rating 2', () => {
    expect(mapTestResultToRating(true, 8000)).toBe(2)
    expect(mapTestResultToRating(true, 15000)).toBe(2)
    expect(mapTestResultToRating(true, 30000)).toBe(2)
  })
})
