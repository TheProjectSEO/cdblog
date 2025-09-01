import { BlogArticleTemplate } from '@/components/blog-article-template'
import { convertBlogPostToTemplate, generateArticleMetadata, defaultFAQs } from '@/lib/blog-template-utils'
import { Metadata } from 'next'

// Example blog post using the new template
const exampleBlogPost = {
  id: "template-example",
  title: "The Ultimate Guide to Paris: Hidden Gems and Must-See Attractions",
  content: `
    <p>Paris, the City of Light, offers countless experiences beyond the typical tourist trail. This comprehensive guide will take you through both iconic landmarks and hidden gems that make Paris truly magical.</p>
    
    <h2 id="iconic-landmarks">Iconic Landmarks You Must Visit</h2>
    <p>While everyone knows about the Eiffel Tower and Louvre, experiencing them with insider knowledge makes all the difference. Here's how to make the most of your visits to these world-famous attractions.</p>
    
    <p>The Eiffel Tower is best experienced at three different times: during daylight for the panoramic city views, at sunset for romantic ambiance, and after dark when it sparkles every hour on the hour. Pro tip: book your tickets online to skip the long lines.</p>
    
    <h2 id="hidden-gems">Hidden Gems Off the Beaten Path</h2>
    <p>Beyond the famous attractions lie Paris's true treasures - charming neighborhoods, secret gardens, and local haunts that most tourists never discover.</p>
    
    <p>The Covered Passages of Paris, like Galerie Vivienne and Passage des Panoramas, offer a glimpse into 19th-century shopping culture. These glass-roofed galleries house unique boutiques, antique bookshops, and cozy cafés.</p>
    
    <h2 id="local-cuisine">Authentic Parisian Cuisine</h2>
    <p>Forget the touristy bistros near major attractions. The best Parisian food is found in neighborhood boulangeries, local markets, and family-run restaurants that have been serving the same recipes for generations.</p>
    
    <p>Start your day with a fresh croissant from a local boulangerie - look for the "Artisan Boulanger" sign which indicates fresh, handmade bread. For lunch, try a traditional French onion soup at a neighborhood bistro, and end your evening with wine and cheese from a local fromagerie.</p>
    
    <h2 id="practical-tips">Practical Tips for First-Time Visitors</h2>
    <p>Navigating Paris like a local requires some insider knowledge. The metro system is extensive and efficient - buy a weekly pass if staying more than three days. Always greet shopkeepers with "Bonjour" when entering and "Au revoir" when leaving - it's considered polite and essential to Parisian culture.</p>
    
    <p>The best time to visit Paris is during shoulder seasons (April-June and September-November) when the weather is pleasant and crowds are manageable. Summer can be crowded and hot, while winter offers fewer tourists but shorter daylight hours.</p>
  `,
  excerpt: "Discover Paris beyond the tourist trail with this comprehensive guide to hidden gems, local cuisine, and insider tips for experiencing the City of Light like a local.",
  slug: "ultimate-guide-paris-hidden-gems",
  author: {
    display_name: "Emma Thompson",
    bio: "Travel writer and Paris resident specializing in European destinations",
    avatar: "/blog-images/authors/emma-thompson.jpg"
  },
  published_at: "2024-03-15T10:00:00Z",
  updated_at: "2024-03-16T14:30:00Z",
  read_time: "8 mins read",
  featured_image_url: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  seo_title: "Ultimate Paris Guide: Hidden Gems & Must-See Attractions | CuddlyNest",
  seo_description: "Discover Paris like a local with our comprehensive guide to hidden gems, authentic cuisine, and practical tips for first-time visitors to the City of Light.",
  meta_keywords: "Paris travel guide, hidden gems Paris, Paris attractions, travel tips France, Paris vacation",
  categories: ["Travel", "Europe", "City Guides"],
  faqs: [
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
      question: "What's the best way to get around Paris?",
      answer: "The Metro is efficient and covers the entire city. For stays longer than 3 days, get a Navigo weekly pass (€22.80). For shorter visits, buy a carnet of 10 tickets (€16) or use contactless payment."
    }
  ],
  status: "published"
}

export const metadata: Metadata = generateArticleMetadata(convertBlogPostToTemplate(exampleBlogPost))

export default function TemplateExamplePage() {
  const article = convertBlogPostToTemplate(exampleBlogPost)
  
  return <BlogArticleTemplate article={article} />
}