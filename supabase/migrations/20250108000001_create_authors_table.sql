-- Create authors table for managing blog authors
CREATE TABLE IF NOT EXISTS public.authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'Travel Expert',
    bio TEXT NOT NULL,
    avatar_url TEXT NOT NULL DEFAULT '/placeholder.svg',
    countries_explored TEXT DEFAULT '50+ countries explored',
    expert_since TEXT DEFAULT 'Expert since 2024',
    followers TEXT DEFAULT '1K+ fellow travelers',
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_authors_updated_at
    BEFORE UPDATE ON public.authors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default authors
INSERT INTO public.authors (id, name, title, bio, avatar_url, countries_explored, expert_since, followers, badges) 
VALUES 
(
    'sarah-johnson',
    'Sarah Johnson',
    'Travel Expert',
    'Your friendly neighborhood travel obsessive who''s been exploring the world for 10+ years. I''m all about finding those hidden gems and sharing the real tea on destinations - no sugar-coating, just honest vibes.',
    '/placeholder.svg',
    '50+ countries explored',
    'Expert since 2014',
    '1M+ fellow travelers',
    '["Adventure seeker", "Food lover", "Culture enthusiast"]'::jsonb
),
(
    'marco-rossi',
    'Marco Rossi',
    'Local Culture Specialist',
    'Born and raised in Rome, I spend my time uncovering the authentic experiences that make each destination unique. From secret family recipes to hidden historical gems.',
    '/placeholder.svg',
    '30+ regions explored',
    'Expert since 2018',
    '500K+ culture enthusiasts',
    '["Local insider", "History buff", "Foodie guide"]'::jsonb
),
(
    'elena-santos',
    'Elena Santos',
    'Adventure Travel Guide',
    'Adrenaline junkie turned travel writer. I specialize in off-the-beaten-path adventures and sustainable travel practices that respect local communities.',
    '/placeholder.svg',
    '40+ countries explored',
    'Expert since 2016',
    '750K+ adventure seekers',
    '["Adventure expert", "Eco traveler", "Mountain guide"]'::jsonb
),
(
    'david-chen',
    'David Chen',
    'Luxury Travel Curator',
    'Former hospitality executive with a passion for creating unforgettable luxury experiences. I know the best hotels, restaurants, and exclusive experiences worldwide.',
    '/placeholder.svg',
    '60+ destinations curated',
    'Expert since 2012',
    '300K+ luxury travelers',
    '["Luxury specialist", "Hotel insider", "Fine dining expert"]'::jsonb
),
(
    'anna-mueller',
    'Anna Mueller',
    'Budget Travel Expert',
    'Proving that amazing travel experiences don''t have to break the bank. I''ve mastered the art of traveling smart, not expensive.',
    '/placeholder.svg',
    '45+ countries on a budget',
    'Expert since 2017',
    '800K+ budget travelers',
    '["Budget master", "Deal finder", "Backpacker pro"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authors are viewable by everyone"
ON public.authors FOR SELECT
USING (true);

CREATE POLICY "Authors are editable by authenticated users"
ON public.authors FOR ALL
USING (auth.role() = 'authenticated');