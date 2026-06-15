import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findRelatedDiaries, generateThemeEvolution } from '@/lib/rag'
import { anthropic } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { diaryId, content, userId } = await request.json()

    const supabase = await createClient()

    const { data: pastDiaries } = await supabase
      .from('diaries')
      .select('id, title, content, created_at, emotion_label')
      .eq('user_id', userId)
      .neq('id', diaryId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!pastDiaries || pastDiaries.length === 0) {
      return NextResponse.json({
        connections: [],
        theme_evolution: '',
        insights: '这是你的第一篇日记，未来年轮会帮你发现日记之间的深层联系 🦉',
      })
    }

    const [connections, themeEvolution] = await Promise.all([
      findRelatedDiaries(content, pastDiaries),
      generateThemeEvolution([...pastDiaries, { content, created_at: new Date().toISOString(), emotion_label: 'neutral' }]),
    ])

    for (const conn of connections) {
      await supabase.from('memory_connections').upsert({
        diary_id: diaryId,
        connected_diary_id: conn.diary_id,
        connection_type: conn.connection_type,
        strength: conn.strength,
        description: conn.description,
      })
    }

    const insightMessage = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `作为年轮猫头鹰馆长，基于以下联系，给用户一句温暖的洞察（50字以内）：
连接了${connections.length}篇过去的日记
联系类型：${connections.map(c => c.connection_type).join('、')}
主题演变：${themeEvolution.slice(0, 100)}

请给出一句有深度的洞察。`
      }]
    })

    const insights = insightMessage.content[0].type === 'text' ? insightMessage.content[0].text : ''

    return NextResponse.json({
      connections,
      theme_evolution: themeEvolution,
      insights,
    })
  } catch (error) {
    console.error('Memories API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
