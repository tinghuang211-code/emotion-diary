'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { DiaryEntry } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import MomoCard from '@/components/characters/MomoCard'
import PaoPaoChat from '@/components/characters/PaoPaoChat'

export default function DiaryViewPage() {
  const params = useParams()
  const router = useRouter()
  const [diary, setDiary] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const fetchDiary = async () => {
      const res = await fetch(`/api/diaries/${params.id}`)
      if (!res.ok) { router.push('/'); return }
      const data = await res.json()
      setDiary(data)
      setLoading(false)
    }
    fetchDiary()
  }, [params.id, router])

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

  if (!diary) return null

  const summaries = Array.isArray(diary.summaries) ? diary.summaries : []

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Top emotion bar */}
      <div
        className="h-1 w-full"
        style={{ background: diary.emotion_color, boxShadow: `0 0 20px ${diary.emotion_color}60` }}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <ArrowLeft size={18} />
            </motion.button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: diary.emotion_color, boxShadow: `0 0 8px ${diary.emotion_color}` }}
              />
              <span className="text-white/40 text-xs">
                {format(new Date(diary.created_at), 'yyyy年M月d日 EEEE', { locale: zhCN })}
              </span>
            </div>
            {diary.title && (
              <h1 className="text-white text-xl font-semibold mt-1">{diary.title}</h1>
            )}
          </div>
          <motion.button
            onClick={() => setShowChat(!showChat)}
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showChat
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
            }`}
          >
            {showChat ? <BookOpen size={13} /> : <MessageCircle size={13} />}
            {showChat ? '查看日记' : '和泡泡聊'}
          </motion.button>
        </div>

        {!showChat ? (
          <div className="flex gap-6">
            {/* Diary content */}
            <div className="flex-1">
              <div className="writing-area text-white/80 text-base leading-8 whitespace-pre-wrap">
                {diary.content}
              </div>

              {diary.soul_card && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 rounded-2xl bg-gradient-to-br from-violet-900/40 to-pink-900/40 border border-violet-400/20 p-5"
                >
                  <p className="text-xs text-violet-400 mb-2 uppercase tracking-wider">💫 今日灵魂卡片</p>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{diary.soul_card}</p>
                </motion.div>
              )}
            </div>

            {/* Momo summaries sidebar */}
            {summaries.length > 0 && (
              <div className="w-64 flex-shrink-0 space-y-3">
                <p className="text-xs text-white/30 mb-3">🐱 墨墨的速记</p>
                {summaries.map(s => (
                  <MomoCard key={s.id} summary={s} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/3 border border-white/10 overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
            <PaoPaoChat diaryContent={diary.content} diaryId={diary.id} />
          </div>
        )}
      </div>
    </div>
  )
}
