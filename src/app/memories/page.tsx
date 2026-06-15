'use client'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DiaryEntry } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

// Group diaries by tag/emotion as "islands"
interface Island {
  label: string
  color: string
  diaries: DiaryEntry[]
  x: number
  y: number
  radius: number
}

export default function MemoriesPage() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [islands, setIslands] = useState<Island[]>([])
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDiaries = async () => {
      const res = await fetch('/api/diaries')
      if (!res.ok) { router.push('/auth/login'); return }
      const data: DiaryEntry[] = await res.json()
      setDiaries(data)

      // Group by emotion label to form islands
      const groups: Record<string, DiaryEntry[]> = {}
      data.forEach(d => {
        const key = d.emotion_label || 'neutral'
        if (!groups[key]) groups[key] = []
        groups[key].push(d)
      })

      const emotionLabels: Record<string, string> = {
        happy: '开心岛',
        sad: '忧伤湾',
        angry: '火焰峰',
        anxious: '迷雾谷',
        thinking: '沉思林',
        calm: '宁静湖',
        neutral: '平原',
      }
      const emotionColors: Record<string, string> = {
        happy: '#FFD700',
        sad: '#6B9FD4',
        angry: '#FF6B6B',
        anxious: '#FFA500',
        thinking: '#C8A2C8',
        calm: '#98D8C8',
        neutral: '#A0A0B0',
      }

      const entries = Object.entries(groups)
      const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 600
      const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 400

      const builtIslands: Island[] = entries.map(([emotion, diaries], i) => {
        const angle = (i / entries.length) * Math.PI * 2
        const dist = 160 + Math.min(diaries.length * 10, 80)
        return {
          label: emotionLabels[emotion] || emotion,
          color: emotionColors[emotion] || '#A0A0B0',
          diaries,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          radius: 30 + diaries.length * 8,
        }
      })
      setIslands(builtIslands)
      setLoading(false)
    }
    fetchDiaries()
  }, [router])

  // Draw connection lines on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || islands.length === 0) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    islands.forEach((island, i) => {
      islands.slice(i + 1).forEach(other => {
        ctx.beginPath()
        ctx.moveTo(island.x, island.y)
        ctx.lineTo(other.x, other.y)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 1
        ctx.stroke()
      })
    })
  }, [islands])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-4">
        <Link href="/">
          <motion.button whileHover={{ scale: 1.05 }} className="text-white/40 hover:text-white/80 transition-colors">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <div>
          <h1 className="text-white font-semibold text-sm">🏝️ 记忆岛屿</h1>
          <p className="text-white/30 text-xs">你的 {diaries.length} 篇日记，形成了 {islands.length} 座岛屿</p>
        </div>
      </div>

      {/* Islands */}
      {islands.map((island, i) => (
        <motion.div
          key={island.label}
          className="absolute cursor-pointer"
          style={{ left: island.x, top: island.y, transform: 'translate(-50%, -50%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1, type: 'spring' }}
          onClick={() => setSelectedIsland(selectedIsland?.label === island.label ? null : island)}
        >
          {/* Island circle */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3 + i, repeat: Infinity }}
            className="rounded-full flex flex-col items-center justify-center shadow-lg"
            style={{
              width: island.radius * 2,
              height: island.radius * 2,
              background: `radial-gradient(circle, ${island.color}30, ${island.color}10)`,
              border: `1.5px solid ${island.color}40`,
              boxShadow: `0 0 20px ${island.color}20`,
            }}
          >
            <span className="text-xs font-medium text-white/80 text-center px-2 leading-tight">{island.label}</span>
            <span className="text-[10px] text-white/40 mt-0.5">{island.diaries.length}篇</span>
          </motion.div>
        </motion.div>
      ))}

      {/* Empty state */}
      {islands.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">🌊</div>
            <p className="text-white/50">还没有日记，先去写几篇吧</p>
            <Link href="/diary/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-4 px-5 py-2 rounded-full bg-violet-500 text-white text-sm"
              >
                写日记
              </motion.button>
            </Link>
          </div>
        </div>
      )}

      {/* Island detail panel */}
      {selectedIsland && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-20 bg-[#0d0d20]/95 border-t border-white/10 backdrop-blur-md p-4 max-h-72 overflow-y-auto"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: selectedIsland.color, boxShadow: `0 0 8px ${selectedIsland.color}` }}
            />
            <h3 className="text-white font-medium text-sm">{selectedIsland.label}</h3>
            <span className="text-white/30 text-xs ml-1">{selectedIsland.diaries.length} 篇日记</span>
            <button
              onClick={() => setSelectedIsland(null)}
              className="ml-auto text-white/30 hover:text-white/60 text-xs"
            >
              关闭
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {selectedIsland.diaries.map(d => (
              <Link key={d.id} href={`/diary/${d.id}`}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: d.emotion_color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs truncate">{d.title || d.content.slice(0, 40) + '...'}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">
                      {format(new Date(d.created_at), 'M月d日', { locale: zhCN })}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
