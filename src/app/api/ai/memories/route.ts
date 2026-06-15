import { NextRequest, NextResponse } from 'next/server'
import { anthropic, NIANLUN_SYSTEM_PROMPT } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { diaryId, content } = await req.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch past diaries (excluding current)
    const { data: pastDiaries } = await supabase
      .from('diaries')
      .select('id, content, emotion_label, created_at, summaries')
      .eq('user_id', user.id)
      .neq('id', diaryId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!pastDiaries || pastDiaries.length === 0) {
      return NextResponse.json({
        connections: [],
        evolution_insight: '这是你的第一篇日记，期待见证你的成长！',
        hidden_pattern: null,
        nian_lun_message: '欢迎来到你的记忆树。每一篇日记都是一片叶子，我会守护它们的。🦉',
      })
    }

    const pastSummaries = pastDiaries.map((d, i) => {
      const firstSummary = Array.isArray(d.summaries) && d.summaries.length > 0
        ? d.summaries[0]
        : null
      const preview = d.content.slice(0, 150)
      return `[日记${i + 1}] (${new Date(d.created_at).toLocaleDateString('zh-CN')}) 情绪:${d.emotion_label} - ${firstSummary?.core_insight || preview}`
    }).join('\n')

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: NIANLUN_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `今天的日记：\n${content}\n\n过去的日记：\n${pastSummaries}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response format')

    const result = JSON.parse(jsonMatch[0])

    // Store memory connections in DB
    if (result.connections && result.connections.length > 0) {
      for (let i = 0; i < Math.min(result.connections.length, 3); i++) {
        const conn = result.connections[i]
        const relatedDiary = pastDiaries[i]
        if (relatedDiary) {
          await supabase.from('memory_connections').insert({
            diary_id: diaryId,
            connected_diary_id: relatedDiary.id,
            connection_type: conn.connection_type || 'theme',
            strength: 0.7,
            description: conn.description,
          })
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Memories error:', error)
    return NextResponse.json({ error: 'Failed to analyze memories' }, { status: 500 })
  }
}
