'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import type { DiaryEntry } from '@/types'
import { EMOTION_COLORS } from '@/lib/emotions'
import type { EmotionType } from '@/lib/emotions'

export default function MemoriesPage() {
  const router = useRouter()
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'timeline' | 'island'>('timeline')

  useEffect(() => {
    fetch('/api/diaries?limit=50')
      .then(r => r.json())
      .then(({ data }) => {
        setDiaries(data || [])
        setLoading(false)
      })
  }, [])

  const emotionStats = diaries.reduce((acc, d) => {
    const type = d.emotion_label as EmotionType
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalDiaries = diaries.length

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">记忆星海</h1>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            {['timeline', 'island'].map(v => (
              <button
                key={v}
                onClick={() => setView(v as typeof view)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  view === v ? 'bg-white/10 text-white' : 'text-white/40'
                }`}
              >
                {v === 'timeline' ? '📅 时间轴' : '🏝️ 记忆岛'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 text-center"
          >
            <div className="text-3xl font-bold text-white">{totalDiaries}</div>
            <div className="text-white/50 text-sm mt-1">记忆总数</div>
          </motion.div>
          {Object.entries(emotionStats).slice(0, 3).map(([emotion, count], i) => (
            <motion.div
              key={emotion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-4 text-center"
            >
              <div className="text-3xl font-bold" style={{ color: EMOTION_COLORS[emotion as EmotionType] || '#C8A2C8' }}>
                {count}
              </div>
              <div className="text-white/50 text-sm mt-1">{emotion}</div>
            </motion.div>
          ))}
        </div>

        {/* Emotion distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#98D8C8]" />
            <h3 className="text-white font-medium">情绪分布</h3>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            {Object.entries(emotionStats).map(([emotion, count]) => (
              <div
                key={emotion}
                style={{
                  width: `${(count / totalDiaries) * 100}%`,
                  backgroundColor: EMOTION_COLORS[emotion as EmotionType] || '#C8A2C8',
                }}
                title={`${emotion}: ${count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {Object.entries(emotionStats).map(([emotion, count]) => (
              <div key={emotion} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EMOTION_COLORS[emotion as EmotionType] || '#C8A2C8' }} />
                <span className="text-white/60 text-xs">{emotion} ({count})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline / Island view */}
        {view === 'timeline' ? (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />
            <div className="space-y-4">
              {diaries.map((diary, i) => {
                const color = EMOTION_COLORS[diary.emotion_label as EmotionType] || '#C8A2C8'
                return (
                  <motion.div
                    key={diary.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex gap-4 cursor-pointer group"
                    onClick={() => router.push(`/diary/${diary.id}`)}
                  >
                    <div className="w-12 flex-shrink-0 flex items-center justify-center">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-[#0a0a1a] group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                    <div className="flex-1 glass rounded-2xl p-4 group-hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-medium text-sm">{diary.title}</h4>
                        <span className="text-white/30 text-xs">
                          {new Date(diary.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs line-clamp-2">{diary.content.slice(0, 100)}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs" style={{ color }}>{diary.emotion_label}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {diaries.map((diary, i) => {
              const color = EMOTION_COLORS[diary.emotion_label as EmotionType] || '#C8A2C8'
              const size = 0.8 + (diary.content.length / 2000)
              return (
                <motion.div
                  key={diary.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/diary/${diary.id}`)}
                >
                  <div
                    className="rounded-3xl p-5 text-center"
                    style={{
                      background: `radial-gradient(circle, ${color}33 0%, ${color}11 100%)`,
                      border: `1px solid ${color}33`,
                      minHeight: `${120 * size}px`,
                    }}
                  >
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="text-white text-xs font-medium line-clamp-2 mb-1">{diary.title}</h4>
                    <p className="text-white/40 text-xs">
                      {new Date(diary.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-white/30">加载记忆中...</div>
        )}
        {!loading && diaries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🌌</div>
            <p className="text-white/40">还没有记忆，去写第一篇日记吧</p>
            <button onClick={() => router.push('/diary/new')} className="mt-4 text-[#C8A2C8] hover:underline">
              开始记录
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
