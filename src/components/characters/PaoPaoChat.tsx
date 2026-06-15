'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { ChatMessage } from '@/types'

interface PaoPaoChatProps {
  diaryContent: string
  diaryId: string
  onSoulCard?: (card: string) => void
}

export default function PaoPaoChat({ diaryContent, diaryId, onSoulCard }: PaoPaoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [soulCard, setSoulCard] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial greeting
    setMessages([{
      role: 'assistant',
      content: '嗨！我是泡泡 🐙 读完你今天写的日记，感觉有些东西想和你聊聊。准备好了吗？',
    }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, diaryContent, diaryId }),
      })

      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
      }

      // Check if soul card was generated
      if (assistantText.includes('【灵魂卡片】')) {
        setSoulCard(assistantText)
        onSoulCard?.(assistantText)
        // Save soul card
        await fetch(`/api/diaries/${diaryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ soul_card: assistantText }),
        })
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '哎呀，泡泡有点晕了... 再试一次？🐙',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <motion.span
          className="text-3xl"
          animate={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          🐙
        </motion.span>
        <div>
          <p className="text-white font-medium text-sm">泡泡</p>
          <p className="text-white/40 text-xs">对话挖掘师</p>
        </div>
        <div className="ml-auto flex gap-1">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i < Math.ceil(messages.filter(m => m.role === 'user').length) ? 'bg-violet-400' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <span className="text-xl mr-2 mt-1 flex-shrink-0">🐙</span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-violet-500/80 text-white rounded-tr-sm'
                    : msg.content.includes('【灵魂卡片】')
                    ? 'bg-gradient-to-br from-violet-900/60 to-pink-900/60 border border-violet-400/30 text-white rounded-tl-sm'
                    : 'bg-white/8 text-white/90 rounded-tl-sm border border-white/5'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <span className="text-xl mr-2">🐙</span>
            <div className="bg-white/8 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!soulCard && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="和泡泡说说心里话..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-violet-500/50 max-h-24"
              rows={1}
            />
            <motion.button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-violet-500 disabled:opacity-30 flex items-center justify-center shadow-lg shadow-violet-500/30"
            >
              <Send size={15} className="text-white" />
            </motion.button>
          </div>
        </div>
      )}

      {soulCard && (
        <div className="px-4 py-3 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">今日灵魂卡片已生成 ✨</p>
        </div>
      )}
    </div>
  )
}
