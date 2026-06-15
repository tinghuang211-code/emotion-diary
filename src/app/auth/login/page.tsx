'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import StarBackground from '@/components/ui/StarBackground'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <StarBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass rounded-3xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="text-2xl font-bold text-white">欢迎回来</h1>
          <p className="text-white/50 mt-1">继续你的内心探索</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-1 block">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C8A2C8] transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-1 block">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C8A2C8] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#FF6B6B] text-sm"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#C8A2C8] to-[#6B9FD4] py-3 rounded-xl font-medium text-white disabled:opacity-50"
          >
            {loading ? '登录中...' : '进入星海 🌟'}
          </motion.button>
        </form>

        <p className="text-center text-white/40 mt-6 text-sm">
          还没有账号？{' '}
          <Link href="/auth/register" className="text-[#C8A2C8] hover:text-white transition-colors">
            创建星海
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
