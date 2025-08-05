import { getModernPostBySlug } from "@/lib/supabase"
import { DynamicSectionRenderer } from "@/components/dynamic-section-renderer"
import { notFound } from "next/navigation"

export default async function TestRealSections() {
  const post = await getModernPostBySlug("naples-amalfi-coast-ultimate-southern-italy-guide")
  
  if (!post) {
    notFound()
  }

  // Only take the first section to isolate the issue
  const firstSection = post.sections?.[0]
  
  console.log('First section data:', {
    id: firstSection?.id,
    template_id: firstSection?.template_id, 
    hasData: !!firstSection?.data,
    dataKeys: Object.keys(firstSection?.data || {})
  })

  return (
    <div>
      <div className="p-8 bg-white">
        <h1 className="text-3xl font-bold mb-4">Real Section Test</h1>
        <p className="mb-4">Post: {post.title}</p>
        <p className="mb-4">Sections: {post.sections?.length || 0}</p>
        <p className="mb-4">First section template: {firstSection?.template_id}</p>
      </div>
      
      {firstSection ? (
        <DynamicSectionRenderer 
          sections={[firstSection]}
          post={post}
        />
      ) : (
        <div className="p-8">No sections found</div>
      )}
    </div>
  )
}