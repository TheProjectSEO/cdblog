import { DynamicSectionRenderer } from '@/components/dynamic-section-renderer'

export default function TestDynamicPage() {
  const mockSections = [{
    id: "test-hero",
    template_id: "6f579a71-463c-43b4-b203-c2cb46c80d47",
    title: "Test Hero",
    data: {
      title: "Test Naples Title",
      subtitle: "Test subtitle",  
      location: "Naples",
      backgroundImage: "https://images.unsplash.com/photo-1520637836862-4d197d17c50a?q=80&w=2940&auto=format&fit=crop"
    },
    position: 0,
    is_active: true,
    template: {
      name: "hero-section",
      component_name: "HeroSection", 
      category: "hero"
    }
  }]

  const mockPost = {
    id: "test-id",
    title: "Test Naples Post",
    excerpt: "Test excerpt"
  }

  return (
    <DynamicSectionRenderer 
      sections={mockSections}
      post={mockPost}
    />
  )
}