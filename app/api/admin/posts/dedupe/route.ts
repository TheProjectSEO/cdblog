import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Use service client if available to bypass RLS safely in admin routes
const db = supabaseAdmin || supabase

export async function GET() {
  try {
    // Fetch a reasonably high limit to cover your dataset
    const { data: rows, error } = await db
      .from('modern_posts')
      .select('id, slug, title, status, created_at, updated_at')
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Group by slug to find duplicates
    const groups = new Map<string, any[]>()
    for (const row of rows || []) {
      if (!row.slug) continue
      const key = row.slug
      const arr = groups.get(key) || []
      arr.push(row)
      groups.set(key, arr)
    }

    const duplicates = Array.from(groups.entries())
      .filter(([_, arr]) => arr.length > 1)
      .map(([slug, arr]) => ({ slug, count: arr.length, items: arr }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ total: rows?.length || 0, duplicateGroups: duplicates })
  } catch (error) {
    console.error('Error listing duplicates:', error)
    return NextResponse.json({ error: 'Failed to list duplicates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const action: 'archive' | 'delete' = body.action === 'delete' ? 'delete' : 'archive'

    // Fetch all posts to process locally
    const { data: rows, error } = await db
      .from('modern_posts')
      .select('id, slug, status, updated_at')

    if (error) throw error

    // Group by slug
    const groups = new Map<string, any[]>()
    for (const row of rows || []) {
      if (!row.slug) continue
      const arr = groups.get(row.slug) || []
      arr.push(row)
      groups.set(row.slug, arr)
    }

    // Determine duplicates to act on (keep newest by updated_at)
    const toArchive: string[] = []
    const toDelete: string[] = []

    groups.forEach((arr) => {
      if (arr.length <= 1) return
      const sorted = arr.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      const keep = sorted[0]
      const rest = sorted.slice(1)
      if (action === 'archive') {
        toArchive.push(...rest.map((r) => r.id))
      } else {
        toDelete.push(...rest.map((r) => r.id))
      }
    })

    let archiveCount = 0
    let deleteCount = 0

    if (toArchive.length > 0) {
      const { error: updErr } = await db
        .from('modern_posts')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .in('id', toArchive)
      if (updErr) throw updErr
      archiveCount = toArchive.length
    }

    if (toDelete.length > 0) {
      const { error: delErr } = await db
        .from('modern_posts')
        .delete()
        .in('id', toDelete)
      if (delErr) throw delErr
      deleteCount = toDelete.length
    }

    return NextResponse.json({
      action,
      archived: archiveCount,
      deleted: deleteCount,
    })
  } catch (error) {
    console.error('Error cleaning duplicates:', error)
    return NextResponse.json({ error: 'Failed to clean duplicates' }, { status: 500 })
  }
}

