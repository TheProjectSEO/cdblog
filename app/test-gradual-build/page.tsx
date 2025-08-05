import { getModernPostBySlug } from "@/lib/supabase"
import { DynamicSectionRenderer } from "@/components/dynamic-section-renderer"
import { Footer } from "@/components/footer"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { LogoImage } from "@/components/LogoImage"
import { notFound } from "next/navigation"

export default async function TestGradualBuild() {
  const post = await getModernPostBySlug("naples-amalfi-coast-ultimate-southern-italy-guide")
  
  if (!post) {
    notFound()
  }

  const translations = [] // Simplified for debugging

  console.log('Full blog page debug:', {
    postId: post.id,
    postTitle: post.title,
    sectionsCount: post.sections?.length || 0
  })

  return (
    <>
      {/* Header with Logo and Language Switcher */}
      <div className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-full mx-auto px-8 py-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <LogoImage 
                src="https://www.cuddlynest.com/images/logo/cn_logo_hpv2_whit_en.png"
                alt="CuddlyNest Logo"
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center ml-auto pr-4">
              <LanguageSwitcher
                currentLanguage="en"
                postSlug={post.slug}
                availableTranslations={translations || []}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Sections - but process them in smaller chunks */}
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Gradual Build Test</h1>
          <p className="mb-4">Sections found: {post.sections?.length || 0}</p>
          
          {post.sections && post.sections.length > 0 ? (
            <div className="space-y-8">
              {post.sections.slice(0, 2).map((section, index) => (
                <div key={section.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">Section {index + 1}: {section.template_id}</h3>
                  <DynamicSectionRenderer 
                    sections={[section]}
                    post={post}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No sections to render</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  )
}