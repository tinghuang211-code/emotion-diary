'use client'

import { motion } from 'framer-motion'
import type { EmotionResult } from '@/types'

interface EmotionBarProps {
  emotion: EmotionResult
}

export default function EmotionBar({ emotion }: EmotionBarProps) {
  return (
    <div className="relative">
      <motion.div
        animate={{ backgroundColor: emotion.color }}
        transition={{ duration: 0.8 }}
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${emotion.color}cc 0%, ${emotion.color}44 50%, transparent 100%)`,
        }}
      />
      <motion.div
        key={emotion.type}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-2 left-4 flex items-center gap-1.5 text-xs"
        style={{ color: emotion.color }}
      >
        <span>{emotion.emoji}</span>
        <span className="opacity-70">{emotion.label}</span>
      </motion.div>
    </div>
  )
}
