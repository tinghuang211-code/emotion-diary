import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('GET diaries error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, content, emotion_color, emotion_label, emotion_score, summaries, soul_card } = body

    const { data, error } = await supabase
      .from('diaries')
      .insert({
        user_id: user.id,
        title: title || `日记 ${new Date().toLocaleDateString('zh-CN')}`,
        content,
        emotion_color: emotion_color || '#C8A2C8',
        emotion_label: emotion_label || 'neutral',
        emotion_score: emotion_score || 0.5,
        summaries: summaries || [],
        soul_card: soul_card || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('POST diary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
