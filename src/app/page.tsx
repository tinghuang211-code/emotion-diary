'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookOpen, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { DiaryEntry, StarData } from '@/types'
import StarBackground from '@/components/ui/StarBackground'

export default function HomePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [stars, setStars] = useState<StarData[]>([])
  const [hoveredStar, setHoveredStar] = useState<StarData | null>(null)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchDiaries()
      else setLoading(false)
    })
  }, [])

  const fetchDiaries = async () => {
    try {
      const res = await fetch('/api/diaries?limit=50')
      const { data } = await res.json()
      setDiaries(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (diaries.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    const newStars: StarData[] = diaries.map((diary, i) => ({
      id: diary.id,
      x: (Math.sin(i * 2.4) * 0.4 + 0.5) * W,
      y: (Math.cos(i * 1.7) * 0.4 + 0.5) * H,
      size: 4 + (diary.content.length / 500),
      color: diary.emotion_color || '#C8A2C8',
      opacity: 0.6 + Math.random() * 0.4,
      diary,
      connections: [],
    }))

    setStars(newStars)
  }, [diaries])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections
    stars.forEach((star, i) => {
      stars.slice(i + 1, i + 3).forEach(other => {
        const dist = Math.hypot(star.x - other.x, star.y - other.y)
        if (dist < 200) {
          ctx.beginPath()
          ctx.moveTo(star.x, star.y)
          ctx.lineTo(other.x, other.y)
          ctx.strokeStyle = `${star.color}22`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })
    })

    // Draw stars
    stars.forEach(star => {
      const isHovered = hoveredStar?.id === star.id
      const size = isHovered ? star.size * 1.5 : star.size

      // Glow
      const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 4)
      gradient.addColorStop(0, `${star.color}88`)
      gradient.addColorStop(1, `${star.color}00`)
      ctx.beginPath()
      ctx.arc(star.x, star.y, size * 4, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
      ctx.fillStyle = star.color
      ctx.globalAlpha = star.opacity
      ctx.fill()
      ctx.globalAlpha = 1
    })

    animFrameRef.current = requestAnimationFrame(drawCanvas)
  }, [stars, hoveredStar])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(drawCanvas)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [drawCanvas])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clicked = stars.find(s => Math.hypot(s.x - x, s.y - y) < s.size * 3)
    if (clicked) router.push(`/diary/${clicked.id}`)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = stars.find(s => Math.hypot(s.x - x, s.y - y) < s.size * 3)
    setHoveredStar(hovered || null)
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] overflow-hidden">
      <StarBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between p-6"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#C8A2C8]" />
          <h1 className="text-xl font-bold text-white/90">脑内小剧场</h1>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/memories')}
                className="glass px-4 py-2 rounded-full text-sm text-white/70 hover:text-white transition-colors"
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                记忆星海
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/diary/new')}
                className="flex items-center gap-2 bg-[#C8A2C8] hover:bg-[#b891b8] px-4 py-2 rounded-full text-sm font-medium text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                新日记
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/login')}
              className="bg-[#C8A2C8] hover:bg-[#b891b8] px-6 py-2 rounded-full text-sm font-medium text-white transition-colors"
            >
              开始探索
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Main content */}
      {!user ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-8xl mb-6">🌌</div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#C8A2C8] to-[#6B9FD4] bg-clip-text text-transparent">
              探索你的内心星海
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-md">
              用AI陪你书写每一个情绪，发现日记背后的深层联系
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/register')}
              className="bg-gradient-to-r from-[#C8A2C8] to-[#6B9FD4] px-8 py-3 rounded-full font-medium text-white text-lg"
            >
              开始我的星海旅程 ✨
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Star map canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            style={{ zIndex: 1 }}
          />

          {/* Hovered star tooltip */}
          <AnimatePresence>
            {hoveredStar && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute z-20 pointer-events-none glass rounded-xl p-3 max-w-xs"
                style={{
                  left: Math.min(hoveredStar.x + 20, window.innerWidth - 250),
                  top: Math.max(hoveredStar.y - 80, 10),
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredStar.color }} />
                  <span className="text-xs text-white/70">{hoveredStar.diary.created_at.slice(0, 10)}</span>
                </div>
                <p className="text-sm text-white font-medium">{hoveredStar.diary.title}</p>
                <p className="text-xs text-white/50 mt-1">{hoveredStar.diary.content.slice(0, 60)}...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
            <div className="glass rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">你的星海</p>
                <p className="text-white font-medium">{diaries.length} 个记忆星球</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/diary/new')}
                className="flex items-center gap-2 bg-[#C8A2C8] hover:bg-[#b891b8] px-4 py-2 rounded-full text-sm font-medium text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                记录今天
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
