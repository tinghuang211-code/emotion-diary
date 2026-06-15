import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { detectEmotionFromKeywords } from '@/lib/emotions'

export async function POST(request: NextRequest) {
  try {
    const { content, diaryId } = await request.json()

    if (!content || content.length < 100) {
      return NextResponse.json({ error: 'Content too short' }, { status: 400 })
    }

    const emotionResult = detectEmotionFromKeywords(content)

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `你是墨墨，一只可爱的猫咪速记员。请分析这段日记内容，给出以下分析：

日记内容：
${content}

请以JSON格式返回分析结果：
{
  "summary": "内容摘要（2-3句话，温柔地描述发生了什么）",
  "thinking_style": "思维方式（例如：情绪驱动叙事、对比论证、发散思维）",
  "core_insight": "核心洞察（1句话，点出最重要的内心状态或发现）",
  "emotion_emoji": "最合适的emoji（1个）",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}

只返回JSON，不要其他文字。`
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

      return NextResponse.json({
        ...parsed,
        emotion: emotionResult,
        diaryId,
        timestamp: new Date().toISOString(),
      })
    } catch {
      return NextResponse.json({
        summary: content.slice(0, 100) + '...',
        thinking_style: '自由叙述',
        core_insight: '记录当下的心情',
        emotion_emoji: emotionResult.emoji,
        keywords: [],
        emotion: emotionResult,
        diaryId,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Summarize API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
