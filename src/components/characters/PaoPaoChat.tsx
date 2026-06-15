'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import type { ChatMessage, DiaryEntry } from '@/types'

interface PaoPaoChatProps {
  diary: DiaryEntry
}

export default function PaoPaoChat({ diary }: PaoPaoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `嗨～ 我是泡泡 🐙 刚才读了你今天写的内容，感觉你的内心有好多故事想说。我们来聊聊？`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [soulCard, setSoulCard] = useState<string | null>(diary.soul_card)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const round = useRef(1)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          diaryContent: diary.content,
          diaryId: diary.id,
          round: round.current,
        }),
      })

      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullText += chunk
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id ? { ...m, content: fullText } : m
        ))
      }

      // Check for soul card
      if (fullText.includes('[SOUL_CARD]')) {
        const parts = fullText.split('[SOUL_CARD]')
        const cardText = parts[1]?.trim()
        if (cardText) {
          setSoulCard(cardText)
          // Save soul card to diary
          await fetch(`/api/diaries/${diary.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ soul_card: cardText }),
          })
          setMessages(prev => prev.map(m =>
            m.id === assistantMsg.id ? { ...m, content: parts[0].trim() } : m
          ))
        }
      }

      round.current += 1
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Soul card display */}
      <AnimatePresence>
        {soulCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-4 mb-4 border border-[#FFD700]/30 text-center"
          >
            <div className="text-yellow-400 text-xs mb-2">✨ 今日灵魂卡片</div>
            <p className="text-white/80 italic text-sm">{soulCard}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass rounded-2xl p-4 mb-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#6B9FD4]/20 flex items-center justify-center flex-shrink-0 text-sm">
                🐙
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#C8A2C8]/30 text-white rounded-tr-sm'
                  : 'bg-white/5 text-white/80 rounded-tl-sm'
              }`}
            >
              {msg.content || (isStreaming && msg.role === 'assistant' ? (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ...
                </motion.span>
              ) : null)}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="和泡泡聊聊吧..."
          disabled={isStreaming}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#6B9FD4] transition-colors text-sm disabled:opacity-50"
        />
        <motion.button
          onClick={sendMessage}
          disabled={!input.trim() || isStreaming}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#6B9FD4] hover:bg-[#5a8ec3] disabled:bg-white/10 px-4 py-3 rounded-xl text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}
