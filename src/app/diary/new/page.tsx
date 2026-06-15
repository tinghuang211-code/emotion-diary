'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import { MomoSummary } from '@/types'
import { detectEmotionFromText } from '@/lib/emotions'
import EmotionBar from '@/components/diary/EmotionBar'
import MomoCard from '@/components/characters/MomoCard'
import NianLunRitual from '@/components/characters/NianLunRitual'
import PaoPaoChat from '@/components/characters/PaoPaoChat'

type Phase = 'writing' | 'saving' | 'ritual' | 'chat'

export default function NewDiaryPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [summaries, setSummaries] = useState<MomoSummary[]>([])
  const [momoLoading, setMomoLoading] = useState(false)
  const [momoVisible, setMomoVisible] = useState(false)
  const [phase, setPhase] = useState<Phase>('writing')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [memoriesResult, setMemoriesResult] = useState<{
    connections: Array<{ connection_type: string; description: string }>
    evolution_insight: string
    hidden_pattern: string | null
    nian_lun_message: string
  } | null>(null)

  const lastSummarizedLength = useRef(0)
  const router = useRouter()

  const currentEmotion = content.length > 20 ? detectEmotionFromText(content) : null

  // Trigger Momo every 500 chars
  const handleContentChange = useCallback(async (value: string) => {
    setContent(value)
    const len = value.length
    if (len - lastSummarizedLength.current >= 500 && !momoLoading) {
      lastSummarizedLength.current = len
      setMomoLoading(true)
      setMomoVisible(true)
      try {
        const res = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: value }),
        })
        if (res.ok) {
          const data = await res.json()
          const summary: MomoSummary = {
            id: uuidv4(),
            chunk_index: summaries.length,
            content_summary: data.content_summary,
            thinking_style: data.thinking_style,
            core_insight: data.core_insight,
            emotion_color: data.emotion_color,
            emotion_emoji: data.emotion_emoji,
            emotion_label: data.emotion_label,
            created_at: new Date().toISOString(),
          }
          setSummaries(prev => [...prev, summary])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setMomoLoading(false)
      }
    }
  }, [momoLoading, summaries.length])

  const handleSave = async () => {
    if (!content.trim()) return
    setPhase('saving')

    try {
      // Create diary
      const res = await fetch('/api/diaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || null,
          content,
          summaries,
          emotion_color: currentEmotion?.color || '#C8A2C8',
          emotion_label: currentEmotion?.label || 'neutral',
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const diary = await res.json()
      setSavedId(diary.id)

      // Start ritual
      setPhase('ritual')

      // Fetch memories in parallel
      const memRes = await fetch('/api/ai/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diaryId: diary.id, content }),
      })
      if (memRes.ok) {
        const memData = await memRes.json()
        setMemoriesResult(memData)
      }
    } catch (err) {
      console.error(err)
      setPhase('writing')
      alert('保存失败，请重试')
    }
  }

  const handleRitualComplete = () => {
    setPhase('chat')
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="今天的标题（可选）"
          className="flex-1 bg-transparent text-white/80 placeholder-white/20 text-sm focus:outline-none"
        />
        {phase === 'writing' && (
          <motion.button
            onClick={handleSave}
            disabled={!content.trim()}
            whileHover={{ scale: content.trim() ? 1.05 : 1 }}
            whileTap={{ scale: content.trim() ? 0.97 : 1 }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs bg-violet-500 disabled:opacity-30 text-white font-medium shadow-lg shadow-violet-500/30"
          >
            <Save size={13} /> 保存日记
          </motion.button>
        )}
      </header>

      {/* Emotion bar */}
      <div className="px-4 py-2">
        <EmotionBar summaries={summaries} currentEmotion={currentEmotion || undefined} />
      </div>

      {phase === 'writing' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Writing area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <textarea
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              placeholder="今天发生了什么？此刻你在想什么？让文字流淌出来..."
              className="writing-area w-full min-h-[calc(100vh-180px)] bg-transparent text-white/90 placeholder-white/15 text-base resize-none focus:outline-none"
              autoFocus
            />
          </div>

          {/* Momo sidebar */}
          <div className="w-72 flex-shrink-0 border-l border-white/5 overflow-y-auto px-3 py-4 space-y-3">
            {/* Momo header */}
            <div className="flex items-center gap-2 mb-1">
              <AnimatePresence>
                {momoLoading && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xl"
                  >
                    🐱
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="text-xs text-white/30">
                {summaries.length > 0 ? `墨墨的 ${summaries.length} 张速记` : '写满500字，墨墨会来速记'}
              </span>
              {momoLoading && (
                <span className="ml-auto text-[10px] text-violet-400 animate-pulse">分析中...</span>
              )}
            </div>

            {/* Momo cards */}
            <AnimatePresence>
              {summaries.map((s, i) => (
                <MomoCard
                  key={s.id}
                  summary={s}
                  isNew={i === summaries.length - 1}
                />
              ))}
            </AnimatePresence>

            {summaries.length === 0 && !momoLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-3 opacity-40"
                >
                  🐱
                </motion.div>
                <p className="text-white/20 text-xs">墨墨正在等待...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Momo appearance animation */}
      <AnimatePresence>
        {momoVisible && momoLoading && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-[#1a1a3a] border border-white/10 px-4 py-2.5 shadow-xl"
          >
            <motion.span
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-xl"
            >
              🐱
            </motion.span>
            <span className="text-xs text-white/70">墨墨正在速记...</span>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-violet-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word count */}
      {phase === 'writing' && (
        <div className="px-6 py-2 border-t border-white/5 flex items-center gap-3">
          <span className="text-white/20 text-xs">{content.length} 字</span>
          {content.length > 0 && content.length < 500 && (
            <span className="text-white/15 text-xs">
              再写 {500 - (content.length % 500)} 字，墨墨就来了
            </span>
          )}
          {currentEmotion && (
            <div className="ml-auto flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: currentEmotion.color, boxShadow: `0 0 6px ${currentEmotion.color}` }}
              />
              <span className="text-white/30 text-xs">{currentEmotion.emoji} {currentEmotion.label}</span>
            </div>
          )}
        </div>
      )}

      {/* Saving indicator */}
      {phase === 'saving' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0a0a1a]/60 backdrop-blur-sm">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-4xl mb-3"
            >
              <Sparkles className="text-violet-400 mx-auto" size={40} />
            </motion.div>
            <p className="text-white/60 text-sm">正在保存日记...</p>
          </div>
        </div>
      )}

      {/* Year ring ritual */}
      <NianLunRitual
        isVisible={phase === 'ritual'}
        memoriesResult={memoriesResult}
        onComplete={handleRitualComplete}
      />

      {/* Paopao chat */}
      {phase === 'chat' && savedId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-[#0a0a1a] flex flex-col"
        >
          <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            <motion.button
              onClick={() => router.push('/')}
              className="text-white/40 hover:text-white/80 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <span className="text-white/60 text-sm">日记已保存 · 现在和泡泡聊聊</span>
            <motion.button
              onClick={() => router.push('/')}
              className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              跳过 →
            </motion.button>
          </header>
          <div className="flex-1 overflow-hidden">
            <PaoPaoChat diaryContent={content} diaryId={savedId} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
