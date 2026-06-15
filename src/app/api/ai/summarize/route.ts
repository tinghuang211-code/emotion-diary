import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MOMO_SYSTEM_PROMPT } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()

    if (!content || content.trim().length < 50) {
      return NextResponse.json({ error: 'Content too short' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: MOMO_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `请分析这段日记内容：\n\n${content}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 })
  }
}
