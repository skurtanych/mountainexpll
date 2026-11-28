import { describe, expect, it } from 'vitest'
import { classNames } from './classNames'

describe('classNames', () => {
  const styles = { button: 'button_x1', 'button--lime': 'button--lime_x2' }

  it('maps names through the css module object', () => {
    expect(classNames(styles, 'button', 'button--lime')).toBe('button_x1 button--lime_x2')
  })

  it('falls back to the raw name when it is missing in styles', () => {
    expect(classNames(styles, 'button', 'unknown')).toBe('button_x1 unknown')
  })

  it('skips falsy values', () => {
    expect(classNames(styles, 'button', false, null, undefined, '', 0)).toBe('button_x1')

    const isActive = true
    const isDisabled = false
    expect(classNames(styles, 'button', isActive && 'button--lime', isDisabled && 'disabled')).toBe(
      'button_x1 button--lime_x2',
    )
  })

  it('returns an empty string when there are no names', () => {
    expect(classNames(styles)).toBe('')
  })
})
