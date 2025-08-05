import { getModernPostBySlug } from "@/lib/supabase"
import { notFound } from "next/navigation"

export default async function TestBlogData() {
  const post = await getModernPostBySlug("naples-amalfi-coast-ultimate-southern-italy-guide")
  
  if (!post) {
    notFound()
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-4">{post.excerpt}</p>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <p>Post ID: {post.id}</p>
        <p>Sections Count: {post.sections?.length || 0}</p>
        <p>Author: {post.author?.display_name || 'Unknown'}</p>
      </div>
    </div>
  )
}