import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'rotterdam-nightlife'
    
    const languages = ['es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const results = []
    
    for (const lang of languages) {
      try {
        // Test if the page loads
        const response = await fetch(`${baseUrl}/blog/${slug}/${lang}`, { 
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        
        // Get debug data
        const debugResponse = await fetch(`${baseUrl}/api/debug-translation?slug=${slug}&lang=${lang}`)
        const debugData = await debugResponse.json()
        
        results.push({
          language: lang,
          pageStatus: response.status,
          pageLoadable: response.status === 200,
          translationExists: debugData.success,
          translationStatus: debugData.translation?.translation_status,
          sectionsCount: debugData.summary?.translatedSectionsCount || 0,
          hotelsCount: debugData.translatedSections?.find((s: any) => s.translated_data?.hotels)?.translated_data?.hotels?.length || 0,
          lastUpdated: debugData.translation?.updated_at
        })
      } catch (error) {
        results.push({
          language: lang,
          pageStatus: 'error',
          pageLoadable: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      slug,
      testResults: results,
      summary: {
        totalLanguages: languages.length,
        workingTranslations: results.filter(r => r.pageLoadable).length,
        completedTranslations: results.filter(r => r.translationStatus === 'completed').length,
        translationsWithFullHotels: results.filter(r => r.hotelsCount === 5).length
      }
    })
    
  } catch (error) {
    console.error('Test translations error:', error)
    return NextResponse.json({ 
      error: 'Failed to test translations', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}