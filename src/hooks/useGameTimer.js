import { useState, useEffect, useRef } from 'react'

export default function useGameTimer (onTick) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(t => {
          const nt = t + 1
          if (onTick) onTick(nt)
          return nt
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, onTick])

  const resetTimer = (initialTime = 0) => {
    setTimeElapsed(initialTime)
  }

  return {
    isPlaying,
    setIsPlaying,
    timeElapsed,
    setTimeElapsed,
    resetTimer
  }
}
