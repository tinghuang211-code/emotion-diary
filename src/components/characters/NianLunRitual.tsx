'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface NianLunRitualProps {
  isVisible: boolean
  memoriesResult?: {
    connections: Array<{ connection_type: string; description: string }>
    evolution_insight: string
    hidden_pattern: string | null
    nian_lun_message: string
  } | null
  onComplete: () => void
}

export default function NianLunRitual({ isVisible, memoriesResult, onComplete }: NianLunRitualProps) {
  const [phase, setPhase] = useState<'saving' | 'flying' | 'insights' | 'done'>('saving')

  useEffect(() => {
    if (!isVisible) { setPhase('saving'); return }
    setPhase('saving')
    const t1 = setTimeout(() => setPhase('flying'), 1200)
    const t2 = setTimeout(() => setPhase('insights'), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && phase !== 'done' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#080818]/80 backdrop-blur-sm"
        >
          <div className="max-w-md w-full mx-4 text-center">
            {/* Owl animation */}
            <motion.div
              className="text-7xl mb-6"
              animate={
                phase === 'flying'
                  ? { y: [-20, -60, -20], rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }
                  : { y: [0, -8, 0] }
              }
              transition={
                phase === 'flying'
                  ? { duration: 1.5, times: [0, 0.5, 1] }
                  : { duration: 2, repeat: Infinity }
              }
            >
              🦉
            </motion.div>

            {phase === 'saving' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-white/70 text-sm">年轮正在收录你的日记...</p>
                <div className="flex justify-center gap-1 mt-3">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'flying' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-white/80 text-sm font-medium">叼着你的故事飞向记忆星空 ✨</p>
                <div className="flex justify-center gap-3 mt-4">
                  {['⭐', '💫', '🌟'].map((star, i) => (
                    <motion.span
                      key={i}
                      className="text-lg"
                      animate={{ y: [-5, -20, -5], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
                    >
                      {star}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'insights' && memoriesResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-lg text-white font-medium">「{memoriesResult.nian_lun_message}」</p>

                {memoriesResult.connections.length > 0 && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-left space-y-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider">🔗 记忆连线</p>
                    {memoriesResult.connections.slice(0, 3).map((c, i) => (
                      <p key={i} className="text-xs text-white/70">• {c.description}</p>
                    ))}
                  </div>
                )}

                {memoriesResult.evolution_insight && (
                  <p className="text-sm text-violet-300 italic">{memoriesResult.evolution_insight}</p>
                )}

                {memoriesResult.hidden_pattern && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2">
                    <p className="text-xs text-amber-300">⚡ {memoriesResult.hidden_pattern}</p>
                  </div>
                )}

                <motion.button
                  onClick={onComplete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-6 py-2 rounded-full bg-violet-500 text-white text-sm font-medium shadow-lg shadow-violet-500/30"
                >
                  和泡泡聊聊 🐙
                </motion.button>
              </motion.div>
            )}

            {phase === 'insights' && !memoriesResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-white/70 text-sm">正在分析记忆关联...</p>
                <motion.button
                  onClick={onComplete}
                  whileHover={{ scale: 1.05 }}
                  className="mt-4 px-6 py-2 rounded-full bg-violet-500 text-white text-sm font-medium"
                >
                  继续 →
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
