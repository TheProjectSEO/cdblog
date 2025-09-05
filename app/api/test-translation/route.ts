import { NextResponse } from 'next/server'

// Language mappings
const languageMap = {
  'fr': 'French',
  'it': 'Italian', 
  'de': 'German',
  'es': 'Spanish'
}

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json()
    
    if (!text || !language) {
      return NextResponse.json({ error: 'Text and language are required' }, { status: 400 })
    }
    
    const translatedText = await translateTextTest(text, language)
    
    return NextResponse.json({
      success: true,
      original: text,
      translated: translatedText,
      language
    })
    
  } catch (error) {
    console.error('Test translation error:', error)
    return NextResponse.json({
      error: 'Translation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function translateTextTest(text: string, languageCode: string): Promise<string> {
  if (!text || text.length < 3) return text
  
  const mistralApiKey = process.env.MISTRAL_API_KEY
  if (!mistralApiKey) throw new Error('MISTRAL_API_KEY not configured')
  
  const targetLanguage = languageMap[languageCode as keyof typeof languageMap]
  
  const prompt = `Translate this text to ${targetLanguage}. Keep all HTML tags and formatting exactly as they are.

IMPORTANT: Respond with ONLY the translated text. Do not include markdown code blocks, HTML wrapper tags, or any other formatting around your response.

Text to translate:
${text}`
  
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`)
    }

    const result = await response.json()
    let translatedText = result.choices[0]?.message?.content?.trim()

    if (!translatedText) {
      throw new Error('No translation received')
    }

    // Clean the response
    translatedText = cleanMistralResponse(translatedText)

    return translatedText
    
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

function cleanMistralResponse(text: string): string {
  console.log('BEFORE cleaning:', text)
  
  // Remove markdown code blocks
  text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '')
  text = text.replace(/^```html\n?/g, '').replace(/\n?```$/g, '')
  
  // Remove any HTML document wrapper tags
  text = text.replace(/^<html[^>]*>/i, '').replace(/<\/html>$/i, '')
  text = text.replace(/^<body[^>]*>/i, '').replace(/<\/body>$/i, '')
  text = text.replace(/^<div[^>]*>/i, '').replace(/<\/div>$/i, '')
  
  // Remove leading/trailing whitespace and newlines
  text = text.trim()
  
  // Remove stray backticks
  text = text.replace(/^`+/, '').replace(/`+$/, '')
  
  console.log('AFTER cleaning:', text)
  return text
}