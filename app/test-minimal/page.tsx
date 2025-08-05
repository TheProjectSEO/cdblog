import { HeroSection } from '@/components/sections/hero-section'

export default function TestPage() {
  return (
    <div>
      <HeroSection 
        title="Test Title"
        description="Test Description"
        location="Test Location"
        heroImage="https://images.unsplash.com/photo-1520637836862-4d197d17c50a?q=80&w=2940&auto=format&fit=crop"
        post={{ title: "Test Post" }}
        data={{ title: "Test Title" }}
      />
    </div>
  )
}