import { createClient } from '@supabase/supabase-js'
import { DynamicSectionRenderer } from '@/components/dynamic-section-renderer'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getTestPostWithSections() {
  // Get the first post
  const { data: posts, error: postsError } = await supabase
    .from('modern_posts')
    .select('*')
    .limit(1)
    .single()
  
  if (postsError || !posts) {
    return null
  }
  
  // Get sections for this post
  const { data: sections, error: sectionsError } = await supabase
    .from('modern_post_sections')
    .select('*')
    .eq('post_id', posts.id)
    .eq('is_active', true)
    .order('position', { ascending: true })
  
  if (sectionsError) {
    console.error('Sections error:', sectionsError)
    return { ...posts, sections: [] }
  }
  
  return { ...posts, sections: sections || [] }
}

export default async function TestFrontendRendering() {
  const post = await getTestPostWithSections()
  
  if (!post) {
    notFound()
  }
  
  // Find the Rich Text Editor section
  const richTextSection = post.sections.find(s => s.template_id === '550e8400-e29b-41d4-a716-446655440000')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info */}
      <div className="bg-blue-50 p-6 m-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-blue-900">
          🔍 Rich Text Editor Section Test
        </h1>
        <div className="space-y-2 text-sm">
          <p><strong>Post:</strong> {post.title}</p>
          <p><strong>Slug:</strong> {post.slug}</p>
          <p><strong>Total Sections:</strong> {post.sections.length}</p>
          <p><strong>Rich Text Editor Found:</strong> {richTextSection ? '✅ Yes' : '❌ No'}</p>
          {richTextSection && (
            <>
              <p><strong>Rich Text Position:</strong> {richTextSection.position}</p>
              <p><strong>Content Length:</strong> {richTextSection.data?.content?.length || 0} characters</p>
            </>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold text-blue-900 mb-2">Section Order:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {post.sections.map((section, index) => {
              const sectionNames = {
                '6f579a71-463c-43b4-b203-c2cb46c80d47': 'Hero Section',
                'e30d9e40-eb3a-41d3-aeac-413cfca52fe0': 'Main Content (HTML)',
                '550e8400-e29b-41d4-a716-446655440000': 'Rich Text Editor',
                'b87245be-1b68-47d4-83a6-fac582a0847f': 'Starter Pack',
                '833666f2-e112-40c0-9d50-02f160b96f3a': 'Where to Stay',
                'e596d688-31d9-4722-926d-18868f50f0cf': 'Things to Do Cards',
                '5251d41a-d7f8-44b6-bfaf-636d50c859b1': 'Attractions Carousel',
                '8642ef7e-6198-4cd4-b0f9-8ba6bb868951': 'Starter Pack (Alt)',
                '03d9efa8-2c31-489d-94af-d2d85f52aa9c': 'AI Itinerary CTA'
              }
              
              const sectionName = sectionNames[section.template_id] || 'Unknown Section'
              const isRichText = section.template_id === '550e8400-e29b-41d4-a716-446655440000'
              
              return (
                <li key={section.id} className={isRichText ? 'font-bold text-green-700' : ''}>
                  Position {section.position}: {sectionName}
                  {isRichText && ' ⭐ (Rich Text Editor)'}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
      
      {/* Render sections */}
      <DynamicSectionRenderer 
        sections={post.sections}
        post={post}
        language="en"
      />
      
      {/* Rich Text Editor Specific Test */}
      {richTextSection && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h2 className="text-xl font-bold text-green-900 mb-4">
              📝 Rich Text Editor Section Test
            </h2>
            <p className="text-sm text-green-700 mb-4">
              This section is rendered specifically to test the Rich Text Editor component:
            </p>
            
            <div className="bg-white p-4 rounded shadow">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: richTextSection.data?.content || 'No content' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}