'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NianLunRitualProps {
  onComplete: () => void
  connectionsFound: number
}

const PHASES = [
  { text: '年轮正在翻阅你的记忆长河...', duration: 1500 },
  { text: '发现了深层的联系...', duration: 1500 },
  { text: '编织记忆的星网...', duration: 1500 },
]

export default function NianLunRitual({ onComplete, connectionsFound }: NianLunRitualProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const advance = (currentPhase: number) => {
      if (currentPhase >= PHASES.length) {
        onComplete()
        return
      }
      timeout = setTimeout(() => {
        setPhase(currentPhase + 1)
        advance(currentPhase + 1)
      }, PHASES[currentPhase]?.duration || 1500)
    }
    advance(0)
    return () => clearTimeout(timeout)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/90 backdrop-blur-sm"
    >
      <div className="text-center px-8">
        {/* Owl animation */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-8xl mb-8"
        >
          🦉
        </motion.div>

        {/* Orbiting stars */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#FFD700', '#C8A2C8', '#98D8C8', '#6B9FD4', '#FFA500'][i],
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: Math.cos((i / 5) * Math.PI * 2) * 60 - 6,
                y: Math.sin((i / 5) * Math.PI * 2) * 60 - 6,
                rotate: 360,
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'linear',
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full opacity-60" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white/70 text-lg mb-4"
          >
            {phase < PHASES.length ? PHASES[phase].text : '整理完成！'}
          </motion.p>
        </AnimatePresence>

        {connectionsFound > 0 && phase >= 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#98D8C8] text-sm"
          >
            发现了 {connectionsFound} 个记忆连接 ✨
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
