import { NextRequest } from 'next/server'
import { anthropic } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { messages, diaryContent, diaryId, round } = await request.json()

    const systemPrompt = `你是泡泡，一只温柔、充满好奇心的小章鱼对话师。你的使命是通过深度对话帮助用户探索内心世界。

用户今天的日记内容：
${diaryContent}

你的对话策略（根据对话轮次调整）：
- 第1-2轮：共情确认，让用户感受到被理解，用温暖的语言反映他们的感受
- 第3-4轮：细节探询，用好奇的方式询问具体细节，帮助用户深入描述
- 第5-6轮：视角挑战，温和地提出另一个看问题的角度
- 第7轮以上：洞察升华，帮助用户发现更深层的意义和成长

当前是第${round || 1}轮对话。

重要规则：
- 每次回复控制在100字以内
- 使用中文回复
- 语气温柔、有趣，像朋友一样
- 不要说教或给建议，主要是倾听和探索
- 适时使用emoji增加温度

${(round || 1) >= 7 ? '在这轮对话结束后，请在回复末尾添加一行 [SOUL_CARD] 然后生成一张今日灵魂卡片（30字以内的诗意总结）' : ''}`

    const stream = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const chunk = encoder.encode(event.delta.text)
              controller.enqueue(chunk)
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
