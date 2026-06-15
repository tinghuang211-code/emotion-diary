'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  twinklePhase: number
}

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      starsRef.current = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        twinklePhase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (_time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      starsRef.current.forEach(star => {
        star.twinklePhase += star.speed * 0.02
        const opacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinklePhase))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
