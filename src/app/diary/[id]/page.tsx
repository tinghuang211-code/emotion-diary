'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Heart } from 'lucide-react'
import type { DiaryEntry } from '@/types'
import PaoPaoChat from '@/components/characters/PaoPaoChat'
import { EMOTION_COLORS, EMOTION_LABELS, EMOTION_EMOJIS } from '@/lib/emotions'
import type { EmotionType } from '@/lib/emotions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DiaryViewPage({ params }: PageProps) {
  const router = useRouter()
  const [diary, setDiary] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'content' | 'chat' | 'memories'>('content')

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/diaries/${id}`)
        .then(r => r.json())
        .then(({ data }) => {
          setDiary(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    })
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          🌙
        </motion.div>
      </div>
    )
  }

  if (!diary) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌌</div>
          <p className="text-white/50">这颗星球不存在了...</p>
          <button onClick={() => router.push('/')} className="mt-4 text-[#C8A2C8]">回到星海</button>
        </div>
      </div>
    )
  }

  const emotionType = diary.emotion_label as EmotionType
  const emotionColor = EMOTION_COLORS[emotionType] || '#C8A2C8'
  const emotionLabel = EMOTION_LABELS[emotionType] || '平静如水'
  const emotionEmoji = EMOTION_EMOJIS[emotionType] || '✨'

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Emotion header bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${emotionColor}88, ${emotionColor}22)` }} />

      <div className="max-w-4xl mx-auto p-6">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回星海</span>
          </button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Calendar className="w-4 h-4" />
            {new Date(diary.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Title & emotion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-2">{diary.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-lg">{emotionEmoji}</span>
            <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: `${emotionColor}22`, color: emotionColor }}>
              {emotionLabel}
            </span>
          </div>
        </motion.div>

        {/* Soul card if exists */}
        {diary.soul_card && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-4 mb-6 border"
            style={{ borderColor: `${emotionColor}33` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4" style={{ color: emotionColor }} />
              <span className="text-sm" style={{ color: emotionColor }}>今日灵魂卡片</span>
            </div>
            <p className="text-white/80 italic">{diary.soul_card}</p>
          </motion.div>
        )}

        {/* Tab navigation */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
          {[
            { key: 'content', label: '📖 日记内容' },
            { key: 'chat', label: '🐙 和泡泡聊' },
            { key: 'memories', label: '🦉 记忆联系' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl p-6"
            >
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{diary.content}</p>

              {diary.summaries && diary.summaries.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span>🐱</span>
                    <span className="text-white/60 text-sm">墨墨的速记</span>
                  </div>
                  {diary.summaries.map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 mb-3">
                      <p className="text-white/70 text-sm">{s.summary}</p>
                      <p className="text-white/40 text-xs mt-1">💡 {s.core_insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PaoPaoChat diary={diary} />
            </motion.div>
          )}

          {activeTab === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🦉</span>
                <h3 className="text-white font-medium">年轮发现的联系</h3>
              </div>
              {diary.connections && diary.connections.length > 0 ? (
                <div className="space-y-3">
                  {diary.connections.map((conn, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => router.push(`/diary/${conn.connected_diary_id}`)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/40">{conn.connection_type}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <div
                              key={j}
                              className="w-2 h-2 rounded-full mx-0.5"
                              style={{ backgroundColor: j < Math.round(conn.strength * 5) ? emotionColor : '#ffffff22' }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/70 text-sm">{conn.description}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">还没有发现联系，继续写日记让年轮探索吧 🌳</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
