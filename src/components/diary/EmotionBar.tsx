'use client'
import { motion } from 'framer-motion'
import { MomoSummary } from '@/types'

interface EmotionBarProps {
  summaries: MomoSummary[]
  currentEmotion?: { color: string; label: string }
}

export default function EmotionBar({ summaries, currentEmotion }: EmotionBarProps) {
  const allColors = [
    ...summaries.map(s => s.emotion_color),
    ...(currentEmotion ? [currentEmotion.color] : []),
  ]

  const gradient = allColors.length > 0
    ? `linear-gradient(90deg, ${allColors.join(', ')})`
    : 'linear-gradient(90deg, #C8A2C8, #6B9FD4)'

  return (
    <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-white/5">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: gradient }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  )
}
