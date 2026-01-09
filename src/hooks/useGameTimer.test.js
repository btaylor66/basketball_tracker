/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useGameTimer from './useGameTimer'

describe('useGameTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('initializes with default values', () => {
    const { result } = renderHook(() => useGameTimer())
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.timeElapsed).toBe(0)
  })

  test('starts timer when isPlaying is set to true', () => {
    const { result } = renderHook(() => useGameTimer())

    act(() => {
      result.current.setIsPlaying(true)
    })

    expect(result.current.isPlaying).toBe(true)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.timeElapsed).toBe(3)
  })

  test('stops timer when isPlaying is set to false', () => {
    const { result } = renderHook(() => useGameTimer())

    act(() => {
      result.current.setIsPlaying(true)
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.timeElapsed).toBe(2)

    act(() => {
      result.current.setIsPlaying(false)
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Time should not have advanced
    expect(result.current.timeElapsed).toBe(2)
  })

  test('calls onTick callback with new time', () => {
    const onTick = vi.fn()
    const { result } = renderHook(() => useGameTimer(onTick))

    act(() => {
      result.current.setIsPlaying(true)
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onTick).toHaveBeenCalledWith(1)
  })

  test('resetTimer sets time to specified value', () => {
    const { result } = renderHook(() => useGameTimer())

    act(() => {
      result.current.setIsPlaying(true)
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.timeElapsed).toBe(5)

    act(() => {
      result.current.resetTimer(100)
    })

    expect(result.current.timeElapsed).toBe(100)
  })
})
