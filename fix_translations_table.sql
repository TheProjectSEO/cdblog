-- Fix for missing post_translations table
-- Run this in your Supabase SQL editor or database console

-- Create post_translations table for blog post translations
CREATE TABLE IF NOT EXISTS post_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_post_id UUID NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  translated_title TEXT NOT NULL,
  translated_excerpt TEXT,
  translated_content TEXT,
  translated_slug TEXT NOT NULL,
  translation_status VARCHAR(20) DEFAULT 'pending' CHECK (translation_status IN ('pending', 'in_progress', 'completed', 'failed')),
  seo_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of post and language
  UNIQUE(original_post_id, language_code)
);

-- Add foreign key constraint (modify as needed based on your posts table name)
-- If your posts table is named differently, change 'modern_posts' to the correct table name
ALTER TABLE post_translations 
ADD CONSTRAINT fk_post_translations_original_post 
FOREIGN KEY (original_post_id) REFERENCES modern_posts(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_translations_original_post ON post_translations(original_post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_language ON post_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_post_translations_status ON post_translations(translation_status);
CREATE INDEX IF NOT EXISTS idx_post_translations_slug ON post_translations(translated_slug);

-- Enable Row Level Security (RLS)
ALTER TABLE post_translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security
-- Allow authenticated users to manage translations
CREATE POLICY "Allow authenticated users to manage post translations" ON post_translations
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access for completed translations
CREATE POLICY "Allow public read access to completed post translations" ON post_translations
  FOR SELECT USING (translation_status = 'completed');

-- Add trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_post_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_translations_updated_at
  BEFORE UPDATE ON post_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_post_translations_updated_at();

-- Verify the table was created successfully
SELECT 'Table created successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'post_translations' 
ORDER BY ordinal_position;