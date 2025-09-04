import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const db = supabaseAdmin || supabase

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { data: existing } = await db
      .from('modern_post_sections')
      .select('*')
      .eq('id', params.id)
      .single()

    const updateData: any = {}
    if (typeof body.position === 'number') updateData.position = body.position
    if (typeof body.is_active === 'boolean') updateData.is_active = body.is_active
    if (body.data && typeof body.data === 'object') {
      // Shallow merge with existing data
      updateData.data = { ...(existing?.data || {}), ...body.data }
    }
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await db
      .from('modern_post_sections')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating section:', error)
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await db
      .from('modern_post_sections')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting section:', error)
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}
