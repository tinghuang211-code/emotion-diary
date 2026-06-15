'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { MomoSummary } from '@/types'

interface MomoCardProps {
  summary: MomoSummary
  onDismiss?: () => void
  isNew?: boolean
}

export default function MomoCard({ summary, onDismiss, isNew = false }: MomoCardProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.div
      initial={isNew ? { x: 80, opacity: 0, scale: 0.9 } : false}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 80, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative rounded-2xl border border-white/10 bg-[#12122a]/90 backdrop-blur-md shadow-xl overflow-hidden"
      style={{ borderLeft: `3px solid ${summary.emotion_color}` }}
    >
      {/* Momo header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <span className="text-lg">🐱</span>
        <span className="text-xs font-medium text-white/80">墨墨的速记</span>
        <span className="ml-auto text-xs">{summary.emotion_emoji}</span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        {onDismiss && (
          <button onClick={onDismiss} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 space-y-2">
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">📌 内容</span>
                <p className="text-xs text-white/80 mt-0.5 leading-relaxed">{summary.content_summary}</p>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">🧠 思维方式</span>
                <p className="text-xs text-violet-300 mt-0.5">{summary.thinking_style}</p>
              </div>
              <div className="rounded-lg p-2" style={{ background: `${summary.emotion_color}20` }}>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">💡 核心观点</span>
                <p className="text-xs text-white mt-0.5 font-medium">{summary.core_insight}</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: summary.emotion_color, boxShadow: `0 0 8px ${summary.emotion_color}` }}
                />
                <span className="text-xs text-white/50">{summary.emotion_label}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
