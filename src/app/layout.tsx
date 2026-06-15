import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '脑内小剧场 - Brain Theater',
  description: '你的AI情感日记，探索内心的星海',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-[#0a0a1a] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
