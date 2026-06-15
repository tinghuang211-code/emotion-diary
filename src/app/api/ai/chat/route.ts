import { NextRequest } from 'next/server'
import { anthropic, PAOPAO_SYSTEM_PROMPT } from '@/lib/anthropic'
import { ChatMessage } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { messages, diaryContent }: { messages: ChatMessage[]; diaryContent: string } = await req.json()

    const systemPrompt = `${PAOPAO_SYSTEM_PROMPT}

用户今天写的日记内容如下（供你参考）：
---
${diaryContent}
---

请基于日记内容和对话历史，继续深入对话。`

    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Failed to chat', { status: 500 })
  }
}
