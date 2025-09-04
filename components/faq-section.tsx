'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, MessageCircle, Sparkles } from 'lucide-react'

interface FAQ {
  id?: string | number
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs?: FAQ[]
}

export function FAQSection({ faqs: propFaqs }: FAQSectionProps) {
  const faqs = propFaqs || []
  
  // Only render if there are FAQs
  if (!faqs || faqs.length === 0) {
    return null
  }

  // Generate FAQ schema markup
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <>
      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema, null, 2)
        }}
      />
      
      <section className="relative bg-white rounded-xl shadow-sm p-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-6 py-3 mb-6">
          <HelpCircle className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Got Questions?</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Frequently Asked Questions
        </h2>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
          Everything you need to know for an amazing trip, answered by travel experts.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="space-y-1">
          {(faqs || []).map((faq, index) => (
            <AccordionItem 
              key={faq.id || index} 
              value={`faq-${faq.id || index}`}
              className="bg-white/50 backdrop-blur-sm border-b border-gray-100 last:border-b-0 hover:bg-white/80 transition-colors"
            >
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <span className="font-semibold text-gray-900 text-lg leading-relaxed text-left">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

    </section>
    </>
  )
}