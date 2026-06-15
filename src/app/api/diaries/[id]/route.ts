import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: connections } = await supabase
      .from('memory_connections')
      .select('*')
      .eq('diary_id', id)

    return NextResponse.json({ data: { ...data, connections: connections || [] } })
  } catch (error) {
    console.error('GET diary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const { data, error } = await supabase
      .from('diaries')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('PATCH diary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('diaries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE diary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
