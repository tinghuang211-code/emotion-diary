'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StarBackground from '@/components/ui/StarBackground'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/auth/login'), 3000)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <StarBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-semibold text-white">创建你的星空</h1>
          <p className="text-white/40 text-sm mt-1">加入脑内小剧场，开始记录你的宇宙</p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-white font-medium">请查收验证邮件</p>
              <p className="text-white/40 text-xs mt-2">点击邮件中的链接完成注册，即将跳转到登录页...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">密码（至少6位）</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-2.5 rounded-xl bg-violet-500 text-white font-medium text-sm disabled:opacity-50 shadow-lg shadow-violet-500/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    创建中...
                  </span>
                ) : '创建我的星空 🌟'}
              </motion.button>
            </form>
          )}

          <p className="text-center text-white/30 text-xs mt-4">
            已有账号？{' '}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">
              登录
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
