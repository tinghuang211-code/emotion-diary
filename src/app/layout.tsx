import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '脑内小剧场 — AI日记',
  description: '你的大脑里住着一群小精灵，每次你写日记，它们就忙碌起来。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0a0a1a] text-white">{children}</body>
    </html>
  )
}
