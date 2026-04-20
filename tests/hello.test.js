import { describe, it, expect } from 'vitest'

describe('test tests', () => {
  it('adds two numbers', () => {
    expect(((x, y) => x + y)(1, 2)).toBe(3)
  })
})
