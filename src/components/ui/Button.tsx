'use client'

import { motion } from 'framer-motion'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-[#C8A2C8] hover:bg-[#b891b8] text-white',
      secondary: 'bg-white/10 hover:bg-white/20 text-white',
      ghost: 'bg-transparent hover:bg-white/10 text-white/70 hover:text-white',
      danger: 'bg-[#FF6B6B]/20 hover:bg-[#FF6B6B]/30 text-[#FF6B6B]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    // Exclude HTML animation event handlers that conflict with Framer Motion types
    const { onAnimationStart, onAnimationEnd, onDragStart, onDragEnd, onDrag, ...rest } = props

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
export default Button
