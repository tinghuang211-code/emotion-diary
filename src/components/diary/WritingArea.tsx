'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { EmotionResult } from '@/types'

interface WritingAreaProps {
  content: string
  onChange: (value: string) => void
  emotion: EmotionResult
}

export default function WritingArea({ content, onChange, emotion }: WritingAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <motion.div
      className="flex-1 relative rounded-2xl overflow-hidden"
      animate={{
        boxShadow: `0 0 40px ${emotion.color}11`,
      }}
      transition={{ duration: 1 }}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => onChange(e.target.value)}
        placeholder={`今天发生了什么？有什么感受想说？\n\n用文字和自己的内心对话吧...`}
        className="w-full h-full min-h-[400px] bg-white/[0.03] text-white/90 placeholder-white/20 resize-none focus:outline-none p-6 text-base leading-relaxed rounded-2xl"
        style={{ caretColor: emotion.color }}
      />

      {/* Character count */}
      <div className="absolute bottom-3 right-4 text-xs text-white/20">
        {content.length} 字
      </div>
    </motion.div>
  )
}
