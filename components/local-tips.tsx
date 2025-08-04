import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Coffee, MapPin, Clock, Euro, Users } from "lucide-react"

export function LocalTips() {
  const tipCategories = [
    {
      title: "Money & Payments",
      icon: Euro,
      color: "bg-green-100 text-green-700",
      tips: [
        "Most places accept cards, but carry some cash for small cafés",
        "Tipping 10% is appreciated but not mandatory",
        "Many museums offer free entry on first Sunday mornings",
      ],
    },
    {
      title: "Getting Around",
      icon: MapPin,
      color: "bg-blue-100 text-blue-700",
      tips: [
        "Buy a weekly Metro pass if staying longer than 3 days",
        "Walking is often faster than Metro for short distances",
        "Avoid rush hours (8-9am, 6-7pm) on public transport",
      ],
    },
    {
      title: "Dining Etiquette",
      icon: Coffee,
      color: "bg-orange-100 text-orange-700",
      tips: [
        "Lunch is typically 12-2pm, dinner after 7:30pm",
        "Say 'Bonjour' when entering shops and restaurants",
        "Don't ask for substitutions - enjoy dishes as prepared",
      ],
    },
    {
      title: "Best Times to Visit",
      icon: Clock,
      color: "bg-purple-100 text-purple-700",
      tips: [
        "Visit popular attractions early morning or late afternoon",
        "Many shops close on Sundays and Monday mornings",
        "Book restaurant reservations in advance for dinner",
      ],
    },
    {
      title: "Cultural Tips",
      icon: Users,
      color: "bg-pink-100 text-pink-700",
      tips: [
        "Learn basic French phrases - locals appreciate the effort",
        "Dress smartly when dining at upscale restaurants",
        "Keep your voice down on public transport",
      ],
    },
    {
      title: "Insider Secrets",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-700",
      tips: [
        "Free WiFi available at all Starbucks and McDonald's",
        "Many parks have free public restrooms",
        "Happy hour at bars is typically 5-7pm",
      ],
    },
  ]

  return (
    <section className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <Lightbulb className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Local Tips & Insider Knowledge</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Navigate Paris like a local with these essential tips from residents and frequent visitors
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tipCategories.map((category, index) => {
          const IconComponent = category.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${category.color.split(" ")[0]}`}>
                    <IconComponent className={`w-5 h-5 ${category.color.split(" ")[1]}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>

                <ul className="space-y-3">
                  {category.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="text-center">
          <Badge className="mb-3 bg-blue-100 text-blue-700">💡 Pro Tip</Badge>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Download These Essential Apps</h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Badge variant="outline">Citymapper (Navigation)</Badge>
            <Badge variant="outline">Google Translate (Language)</Badge>
            <Badge variant="outline">Foursquare (Recommendations)</Badge>
            <Badge variant="outline">OpenTable (Reservations)</Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
