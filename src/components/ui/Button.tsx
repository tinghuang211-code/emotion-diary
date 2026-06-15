'use client'
import { motion } from 'framer-motion'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
  loading?: boolean
}

export default function Button({ variant = 'primary', children, loading, className = '', disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/30',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </motion.button>
  )
}
