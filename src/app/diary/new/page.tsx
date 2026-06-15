'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, ArrowLeft, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { detectEmotionFromKeywords } from '@/lib/emotions'
import EmotionBar from '@/components/diary/EmotionBar'
import WritingArea from '@/components/diary/WritingArea'
import MomoCard from '@/components/characters/MomoCard'
import NianLunRitual from '@/components/characters/NianLunRitual'
import PaoPaoChat from '@/components/characters/PaoPaoChat'
import type { MomoSummary, EmotionResult, NianLunResult, DiaryEntry } from '@/types'

export default function NewDiaryPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [emotion, setEmotion] = useState<EmotionResult>({
    type: 'neutral',
    color: '#C8A2C8',
    label: '平静如水',
    emoji: '✨',
    score: 0.5,
  })
  const [summaries, setSummaries] = useState<MomoSummary[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [savedDiary, setSavedDiary] = useState<DiaryEntry | null>(null)
  const [showNianLun, setShowNianLun] = useState(false)
  const [nianLunResult, setNianLunResult] = useState<NianLunResult | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const lastSummaryLength = useRef(0)
  const summaryTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  // Update emotion as user types
  useEffect(() => {
    if (content.length > 50) {
      const result = detectEmotionFromKeywords(content)
      setEmotion(result)
    }
  }, [content])

  // Trigger Momo summary every 500 chars
  useEffect(() => {
    if (content.length - lastSummaryLength.current >= 500 && content.length >= 500) {
      if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current)
      summaryTimerRef.current = setTimeout(() => {
        triggerMomoSummary()
        lastSummaryLength.current = content.length
      }, 1000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  const triggerMomoSummary = async () => {
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, diaryId: 'temp' }),
      })
      const data = await res.json()
      if (data.summary) {
        setSummaries(prev => [...prev, { ...data, content_length: content.length }])
      }
    } catch (err) {
      console.error('Momo summary error:', err)
    }
  }

  const handleSave = async () => {
    if (!content.trim() || isSaving) return
    setIsSaving(true)

    try {
      const res = await fetch('/api/diaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `日记 ${new Date().toLocaleDateString('zh-CN')}`,
          content,
          emotion_color: emotion.color,
          emotion_label: emotion.type,
          emotion_score: emotion.score,
          summaries,
        }),
      })
      const { data } = await res.json()
      setSavedDiary(data)
      setShowNianLun(true)

      // Run memory analysis
      if (user) {
        const memRes = await fetch('/api/ai/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diaryId: data.id, content, userId: user.id }),
        })
        const memData = await memRes.json()
        setNianLunResult(memData)
      }
    } catch (err) {
      console.error('Save error:', err)
      setIsSaving(false)
    }
  }

  const handleNianLunComplete = () => {
    setShowNianLun(false)
    setShowChat(true)
  }

  if (showChat && savedDiary) {
    return (
      <div className="min-h-screen bg-[#0a0a1a]">
        <div className="max-w-4xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <button
              onClick={() => router.push('/')}
              className="text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-white/60 text-sm">已保存：{savedDiary.title}</span>
          </motion.div>

          {nianLunResult && nianLunResult.connections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4 mb-6 border border-[#98D8C8]/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🦉</span>
                <span className="text-[#98D8C8] font-medium">年轮发现了联系</span>
              </div>
              <p className="text-white/70 text-sm mb-3">{nianLunResult.insights}</p>
              <div className="flex flex-wrap gap-2">
                {nianLunResult.connections.slice(0, 3).map((conn, i) => (
                  <div key={i} className="bg-white/5 rounded-lg px-3 py-1 text-xs text-white/60">
                    {conn.connection_type === 'theme' ? '📖' : conn.connection_type === 'emotion' ? '💭' : '✨'}
                    {' '}{conn.description}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <PaoPaoChat diary={savedDiary} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      <EmotionBar emotion={emotion} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={() => router.push('/')}
          className="text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="给今天的故事起个名字..."
          className="flex-1 mx-4 bg-transparent text-center text-white/70 placeholder-white/30 focus:outline-none text-sm"
        />
        <motion.button
          onClick={handleSave}
          disabled={!content.trim() || isSaving}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-[#C8A2C8] disabled:bg-white/10 hover:bg-[#b891b8] px-4 py-2 rounded-full text-sm text-white transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '保存中...' : '封存记忆'}
        </motion.button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 gap-4 px-4 pb-4 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <WritingArea
            content={content}
            onChange={setContent}
            emotion={emotion}
          />

          {/* Character hint */}
          <AnimatePresence>
            {content.length > 0 && content.length < 500 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-center text-white/30 text-xs"
              >
                🐱 墨墨在等你写完500字，会来帮你整理思绪...（还差 {500 - content.length} 字）
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Momo sidebar */}
        <AnimatePresence>
          {summaries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-72 flex flex-col gap-3 overflow-y-auto"
            >
              <div className="flex items-center gap-2 py-2">
                <span className="text-lg">🐱</span>
                <span className="text-white/60 text-sm font-medium">墨墨的速记本</span>
                <Sparkles className="w-3 h-3 text-[#FFD700]" />
              </div>
              {summaries.map((summary, i) => (
                <MomoCard key={i} summary={summary} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NianLun Ritual */}
      <AnimatePresence>
        {showNianLun && (
          <NianLunRitual
            onComplete={handleNianLunComplete}
            connectionsFound={nianLunResult?.connections.length || 0}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
