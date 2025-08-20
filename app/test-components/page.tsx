import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { LogoImage } from "@/components/LogoImage"
import { Footer } from "@/components/footer"
import { HotelCarousel } from "@/components/hotel-carousel"

export default function TestComponents() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Component Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">LogoImage Test:</h2>
        <LogoImage 
          src="https://www.cuddlynest.com/images/logo/cn_logo_hpv2_whit_en.png"
          alt="CuddlyNest Logo"
          className="h-10 w-auto"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">LanguageSwitcher Test:</h2>
        <LanguageSwitcher
          currentLanguage="en"
          postSlug="test-slug"
          availableTranslations={[]}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Hotel Carousel Test (2 Full + 1 Peeking):</h2>
        <HotelCarousel 
          title="Where to Stay in Italian Lakes"
          description="Discover beautiful accommodations with lake views and luxury amenities"
          destination="Italian Lakes"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Footer Test:</h2>
        <Footer />
      </div>
    </div>
  )
}