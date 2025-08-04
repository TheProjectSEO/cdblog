'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQ {
  id?: string | number
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs?: FAQ[]
}

export function FAQSection({ faqs: propFaqs }: FAQSectionProps) {
  const defaultFaqs = [
    {
      id: 1,
      question: "What's the best time to visit Paris?",
      answer: "Paris is magical year-round, but April-June and September-October offer the perfect balance of pleasant weather and fewer crowds. Spring brings blooming flowers, while fall offers cozy café vibes and beautiful autumn colors."
    },
    {
      id: 2,
      question: "How many days do I need to see Paris properly?",
      answer: "We recommend at least 4-5 days for first-time visitors to see the major attractions. A week allows for a more relaxed pace and exploration of different neighborhoods. Two weeks lets you truly live like a local!"
    },
    {
      id: 3,
      question: "Do I need to speak French to travel in Paris?",
      answer: "While knowing basic French phrases is appreciated, most tourist areas have English-speaking staff. Download a translation app, learn 'Bonjour' and 'Merci,' and Parisians will be delighted by your effort!"
    },
    {
      id: 4,
      question: "How much should I budget per day in Paris?",
      answer: "Budget travelers can manage on €50-80/day, mid-range travelers should plan for €100-200/day, and luxury travelers might spend €300+/day. This includes accommodation, meals, attractions, and transportation."
    },
    {
      id: 5,
      question: "What's the best way to pay for things in Paris?",
      answer: "Credit cards are widely accepted, but carry some cash for small cafés, markets, and tips. Contactless payments are very popular. Avoid exchanging money at airports - use ATMs or banks for better rates."
    },
    {
      id: 6,
      question: "What's the best way to get from the airport to the city?",
      answer: "From CDG: RER B train (€10, 45 mins) or taxi (€50-70, 45-60 mins). From Orly: Orlyval + RER B (€12, 40 mins) or taxi (€30-50, 30-45 mins). Uber and airport buses are also available."
    },
    {
      id: 7,
      question: "Should I buy a Metro pass?",
      answer: "For stays longer than 3 days, get a Navigo weekly pass (€22.80). For shorter visits, buy a carnet of 10 tickets (€16) or use contactless payment. The Metro is efficient and covers the entire city."
    },
    {
      id: 8,
      question: "Do I need to book tickets in advance for major attractions?",
      answer: "Yes! Book Eiffel Tower, Louvre, and other major attractions online to skip lines. Some attractions like Sainte-Chapelle have limited capacity. Arc de Triomphe and Notre-Dame (when reopened) also benefit from advance booking."
    },
    {
      id: 9,
      question: "Is the Eiffel Tower worth visiting, or is it too touristy?",
      answer: "It's touristy for a reason - it's incredible! Visit at different times: daylight for city views, sunset for romance, and night for the sparkling light show (every hour after dark). The view from Trocadéro is free and stunning."
    },
    {
      id: 10,
      question: "What are some hidden gems tourists usually miss?",
      answer: "Don't miss Père Lachaise Cemetery, the covered passages like Galerie Vivienne, the Promenade Plantée (elevated park), and the evening light show at the Eiffel Tower. Local markets like Marché Saint-Germain offer authentic experiences."
    }
  ]

  const faqs = propFaqs || defaultFaqs

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
          Everything you need to know for an amazing Paris trip.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {(faqs || []).map((faq, index) => (
          <AccordionItem 
            key={faq.id || index} 
            value={`faq-${faq.id || index}`}
            className="bg-gray-50 rounded-lg border-0 shadow-sm"
          >
            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
              <span className="font-semibold text-gray-900">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}