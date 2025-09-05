-- Comprehensive Category Management System Migration
-- Based on PRD requirements for CuddlyNest blog platform

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.category_faqs CASCADE;
DROP TABLE IF EXISTS public.post_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Create Categories Table (Core category data with full SEO support)
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    
    -- SEO fields
    seo_title VARCHAR(255),
    seo_description TEXT,
    meta_keywords TEXT,
    canonical_url VARCHAR(500),
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT, -- URL to OG image
    
    -- Content fields
    description TEXT,
    custom_content TEXT, -- Rich HTML content for category pages
    excerpt TEXT,
    
    -- Visual and organization
    color VARCHAR(7) DEFAULT '#6B46C1', -- Hex color code
    featured_image TEXT, -- URL to featured image
    parent_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    
    -- Publishing controls
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'draft')),
    
    -- Analytics and engagement
    post_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure slug is URL-friendly
    CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- Create Category FAQs Table (FAQ management with sorting capabilities)
CREATE TABLE public.category_faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Post Categories Junction Table (Many-to-many relationship)
CREATE TABLE public.post_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL, -- References modern_posts.id
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure unique post-category combinations
    UNIQUE(post_id, category_id)
);

-- Create indexes for performance optimization
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_published ON public.categories(is_published);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_category_id);
CREATE INDEX idx_categories_featured ON public.categories(is_featured) WHERE is_featured = true;
CREATE INDEX idx_categories_visibility ON public.categories(visibility);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

CREATE INDEX idx_category_faqs_category_id ON public.category_faqs(category_id);
CREATE INDEX idx_category_faqs_sort_order ON public.category_faqs(category_id, sort_order);
CREATE INDEX idx_category_faqs_active ON public.category_faqs(is_active) WHERE is_active = true;

CREATE INDEX idx_post_categories_post_id ON public.post_categories(post_id);
CREATE INDEX idx_post_categories_category_id ON public.post_categories(category_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_faqs_updated_at BEFORE UPDATE ON public.category_faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update post_count when posts are categorized
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update post count for affected categories
    IF TG_OP = 'INSERT' THEN
        UPDATE public.categories 
        SET post_count = (
            SELECT COUNT(*)
            FROM public.post_categories pc
            INNER JOIN public.modern_posts mp ON pc.post_id = mp.id
            WHERE pc.category_id = NEW.category_id 
            AND mp.status = 'published'
        )
        WHERE id = NEW.category_id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE public.categories 
        SET post_count = (
            SELECT COUNT(*)
            FROM public.post_categories pc
            INNER JOIN public.modern_posts mp ON pc.post_id = mp.id
            WHERE pc.category_id = OLD.category_id 
            AND mp.status = 'published'
        )
        WHERE id = OLD.category_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_category_post_count
    AFTER INSERT OR DELETE ON public.post_categories
    FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Function to generate slug from name if not provided
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug = trim(both '-' from NEW.slug);
    END IF;
    
    -- Ensure slug uniqueness by appending number if needed
    WHILE EXISTS (SELECT 1 FROM public.categories WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
        IF NEW.slug ~ '-[0-9]+$' THEN
            NEW.slug = regexp_replace(NEW.slug, '-([0-9]+)$', '-' || (regexp_replace(NEW.slug, '.*-([0-9]+)$', '\1')::int + 1)::text);
        ELSE
            NEW.slug = NEW.slug || '-2';
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_category_slug
    BEFORE INSERT OR UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION generate_category_slug();

-- Function to set published_at timestamp when status changes to published
CREATE OR REPLACE FUNCTION set_category_published_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set published_at when category is published for the first time
    IF NEW.is_published = true AND (OLD.is_published = false OR OLD.published_at IS NULL) THEN
        NEW.published_at = TIMEZONE('utc'::text, NOW());
    END IF;
    
    -- Clear published_at when unpublished
    IF NEW.is_published = false THEN
        NEW.published_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_set_category_published_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION set_category_published_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access to published categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (is_published = true AND visibility = 'public');

CREATE POLICY "Category FAQs are viewable by everyone" ON public.category_faqs
    FOR SELECT USING (
        is_active = true AND 
        EXISTS (
            SELECT 1 FROM public.categories 
            WHERE id = category_id 
            AND is_published = true 
            AND visibility = 'public'
        )
    );

CREATE POLICY "Post categories are viewable by everyone" ON public.post_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.categories 
            WHERE id = category_id 
            AND is_published = true 
            AND visibility = 'public'
        )
    );

-- Admin policies (full access) - these would be refined based on your auth system
CREATE POLICY "Admin full access to categories" ON public.categories
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to category FAQs" ON public.category_faqs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to post categories" ON public.post_categories
    FOR ALL USING (true) WITH CHECK (true);

-- Insert some default categories for travel blog
INSERT INTO public.categories (name, slug, description, seo_description, is_published, is_featured, sort_order) VALUES
    ('Destinations', 'destinations', 'Travel destinations and location guides', 'Discover amazing travel destinations around the world with our comprehensive guides and tips.', true, true, 1),
    ('Travel Tips', 'travel-tips', 'Practical advice and tips for travelers', 'Get expert travel tips and advice to make your trips more enjoyable and hassle-free.', true, true, 2),
    ('Food & Dining', 'food-dining', 'Culinary experiences and restaurant guides', 'Explore local cuisines and discover the best dining experiences around the world.', true, false, 3),
    ('Accommodation', 'accommodation', 'Hotels, resorts, and lodging recommendations', 'Find the perfect place to stay with our curated accommodation recommendations.', true, false, 4),
    ('Adventure Travel', 'adventure-travel', 'Outdoor activities and adventure sports', 'Discover thrilling adventure activities and outdoor experiences for the adventurous traveler.', true, false, 5),
    ('Budget Travel', 'budget-travel', 'Affordable travel options and money-saving tips', 'Travel more while spending less with our budget-friendly travel guides and tips.', true, false, 6);

-- Add some sample FAQs for the Destinations category
INSERT INTO public.category_faqs (category_id, question, answer, sort_order) 
SELECT 
    id,
    'What are the best times to visit popular destinations?',
    'The best time to visit depends on the specific destination, weather patterns, and your travel preferences. Generally, shoulder seasons (spring and fall) offer good weather with fewer crowds.',
    1
FROM public.categories WHERE slug = 'destinations';

INSERT INTO public.category_faqs (category_id, question, answer, sort_order)
SELECT 
    id,
    'How do I choose the right destination for my trip?',
    'Consider your budget, interests, travel style, and the type of experience you want. Research the climate, cultural attractions, activities available, and visa requirements.',
    2
FROM public.categories WHERE slug = 'destinations';

-- Update post counts for all categories
UPDATE public.categories 
SET post_count = (
    SELECT COUNT(*)
    FROM public.post_categories pc
    INNER JOIN public.modern_posts mp ON pc.post_id = mp.id
    WHERE pc.category_id = categories.id 
    AND mp.status = 'published'
);

COMMENT ON TABLE public.categories IS 'Core category data with full SEO support for travel blog organization';
COMMENT ON TABLE public.category_faqs IS 'FAQ management with sorting capabilities for each category';
COMMENT ON TABLE public.post_categories IS 'Many-to-many relationship between posts and categories';

COMMENT ON COLUMN public.categories.custom_content IS 'Rich HTML content for category landing pages';
COMMENT ON COLUMN public.categories.post_count IS 'Automatically updated count of published posts in this category';
COMMENT ON COLUMN public.categories.visibility IS 'Controls category visibility: public, private, or draft';