import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const db = supabaseAdmin || supabase

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_id, template_id, data, position = 0, is_active = true } = body || {}

    if (!post_id || !template_id) {
      return NextResponse.json({ error: 'post_id and template_id are required' }, { status: 400 })
    }

    const payload: any = {
      post_id,
      template_id,
      position,
      is_active,
      data: data || {}
    }

    const { data: created, error } = await db
      .from('modern_post_sections')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating section:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}
