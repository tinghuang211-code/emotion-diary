import { anthropic } from './anthropic'

export interface DiaryChunk {
  id: string
  diary_id: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface MemoryConnection {
  diary_id: string
  title: string | null
  content_preview: string
  created_at: string
  emotion_label: string
  connection_type: string
  strength: number
  description: string
}

export async function findRelatedDiaries(
  currentContent: string,
  pastDiaries: Array<{ id: string; title: string | null; content: string; created_at: string; emotion_label: string }>,
  topK: number = 5
): Promise<MemoryConnection[]> {
  if (pastDiaries.length === 0) return []

  const diariesText = pastDiaries.map((d, i) =>
    `[${i + 1}] ID: ${d.id}\n日期: ${d.created_at}\n情绪: ${d.emotion_label}\n内容: ${d.content.slice(0, 500)}`
  ).join('\n\n---\n\n')

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `你是年轮，一位智慧的猫头鹰馆长，负责帮助用户发现日记之间的深层联系。

当前日记内容：
${currentContent.slice(0, 1000)}

过去的日记：
${diariesText}

请分析当前日记与过去日记的联系，找出最相关的${Math.min(topK, pastDiaries.length)}篇。
对每篇相关日记，分析：
1. 联系类型（theme主题/emotion情绪/person人物/insight洞察）
2. 联系强度（0-1之间）
3. 联系描述（一句话）

以JSON格式返回，格式如下：
{
  "connections": [
    {
      "diary_index": 1,
      "connection_type": "theme",
      "strength": 0.8,
      "description": "联系描述"
    }
  ]
}

只返回JSON，不要其他文字。`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return []

    const parsed = JSON.parse(jsonMatch[0])
    const connections: MemoryConnection[] = []

    for (const conn of parsed.connections || []) {
      const diary = pastDiaries[conn.diary_index - 1]
      if (!diary) continue

      connections.push({
        diary_id: diary.id,
        title: diary.title,
        content_preview: diary.content.slice(0, 200),
        created_at: diary.created_at,
        emotion_label: diary.emotion_label,
        connection_type: conn.connection_type,
        strength: conn.strength,
        description: conn.description,
      })
    }

    return connections.sort((a, b) => b.strength - a.strength).slice(0, topK)
  } catch {
    return []
  }
}

export async function generateThemeEvolution(
  diaries: Array<{ content: string; created_at: string; emotion_label: string }>
): Promise<string> {
  if (diaries.length < 2) return ''

  const diariesText = diaries.slice(-10).map(d =>
    `日期: ${d.created_at.slice(0, 10)} | 情绪: ${d.emotion_label}\n${d.content.slice(0, 300)}`
  ).join('\n\n---\n\n')

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `分析这些日记的主题演变，用2-3句话描述这段时间内的情感和思维变化趋势：\n\n${diariesText}\n\n请给出简洁的洞察。`
    }]
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}
