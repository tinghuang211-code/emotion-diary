'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import StarBackground from '@/components/ui/StarBackground'
import { DiaryEntry } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { PenLine, BookOpen, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface StarDiary extends DiaryEntry {
  cx: number
  cy: number
}

export default function HomePage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [diaries, setDiaries] = useState<StarDiary[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser({ email: user.email || '' })

      const res = await fetch('/api/diaries')
      if (res.ok) {
        const data: DiaryEntry[] = await res.json()
        const w = window.innerWidth
        const h = window.innerHeight
        const starred = data.map((d, i) => ({
          ...d,
          cx: 100 + (Math.sin(i * 2.1) * 0.4 + 0.5) * (w - 200),
          cy: 80 + (Math.cos(i * 1.7) * 0.4 + 0.5) * (h - 160),
        }))
        setDiaries(starred)
      }
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      <StarBackground />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="text-white font-semibold text-sm">脑内小剧场</span>
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="text-white/40 text-xs hidden sm:block">{user.email}</span>}
          <Link href="/memories">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              <BookOpen size={13} /> 记忆地图
            </motion.button>
          </Link>
          <Link href="/diary/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs bg-violet-500 text-white font-medium shadow-lg shadow-violet-500/30"
            >
              <PenLine size={13} /> 写日记
            </motion.button>
          </Link>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </nav>

      {/* Stars for diaries */}
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        {diaries.map((diary) => (
          <motion.div
            key={diary.id}
            className="absolute cursor-pointer"
            style={{ left: diary.cx, top: diary.cy }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.random() * 0.5, type: 'spring' }}
            onHoverStart={() => setHoveredId(diary.id)}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => router.push(`/diary/${diary.id}`)}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                background: diary.emotion_color,
                boxShadow: `0 0 12px 4px ${diary.emotion_color}60`,
              }}
            />

            <AnimatePresence>
              {hoveredId === diary.id && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  className="absolute z-20 bottom-5 left-1/2 -translate-x-1/2 w-48 rounded-xl bg-[#12122a]/95 border border-white/10 p-3 shadow-xl pointer-events-none"
                >
                  <p className="text-white text-xs font-medium line-clamp-2">
                    {diary.title || diary.content.slice(0, 40) + '...'}
                  </p>
                  <p className="text-white/40 text-[10px] mt-1">
                    {format(new Date(diary.created_at), 'M月d日', { locale: zhCN })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: diary.emotion_color }} />
                    <span className="text-[10px] text-white/50">{diary.emotion_label}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {!loading && diaries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-2xl font-semibold text-white mb-2">你的星空还是空的</h1>
            <p className="text-white/50 text-sm mb-6">写下第一篇日记，点亮你的第一颗星</p>
            <Link href="/diary/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-full bg-violet-500 text-white font-medium shadow-lg shadow-violet-500/30"
              >
                开始写日记 ✍️
              </motion.button>
            </Link>
          </motion.div>
        </div>
      )}

      {diaries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center"
        >
          <p className="text-white/30 text-xs">{diaries.length} 颗星星 · 点击查看日记</p>
        </motion.div>
      )}
    </div>
  )
}
