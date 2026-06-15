'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import StarBackground from '@/components/ui/StarBackground'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <StarBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-white mb-2">星海已创建！</h2>
          <p className="text-white/50">请检查邮箱完成验证，正在跳转登录页...</p>
        </motion.div>
      </div>
    )
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
          <div className="text-5xl mb-3">🌟</div>
          <h1 className="text-2xl font-bold text-white">创建你的星海</h1>
          <p className="text-white/50 mt-1">开始记录内心的每一个瞬间</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-1 block">昵称</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C8A2C8] transition-colors"
              placeholder="你的星际代号"
            />
          </div>
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
              placeholder="至少8位密码"
              minLength={8}
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
            {loading ? '创建中...' : '点亮第一颗星 ✨'}
          </motion.button>
        </form>

        <p className="text-center text-white/40 mt-6 text-sm">
          已有账号？{' '}
          <Link href="/auth/login" className="text-[#C8A2C8] hover:text-white transition-colors">
            回到星海
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
