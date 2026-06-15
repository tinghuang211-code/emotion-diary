'use client'

import { motion } from 'framer-motion'
import type { MomoSummary } from '@/types'

interface MomoCardProps {
  summary: MomoSummary
  index: number
}

export default function MomoCard({ summary, index }: MomoCardProps) {
  const colors = ['#FFD700', '#C8A2C8', '#98D8C8', '#6B9FD4', '#FFA500']
  const accentColor = summary.emotion?.color || colors[index % colors.length]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl p-4 text-sm"
      style={{
        background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 100%)`,
        border: `1px solid ${accentColor}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🐱</span>
        <span className="text-xs text-white/40">速记 #{index + 1}</span>
        <span className="ml-auto text-base">{summary.emotion_emoji}</span>
      </div>

      <p className="text-white/80 text-xs leading-relaxed mb-2">{summary.summary}</p>

      <div
        className="rounded-lg px-2 py-1 text-xs mb-2"
        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
      >
        🧠 {summary.thinking_style}
      </div>

      <div className="text-white/50 text-xs">
        💡 {summary.core_insight}
      </div>

      {summary.keywords && summary.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {summary.keywords.map((kw, i) => (
            <span key={i} className="text-xs text-white/30 bg-white/5 rounded px-1.5 py-0.5">
              #{kw}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
