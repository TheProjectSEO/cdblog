-- Create translated_sections table for storing translated section data
CREATE TABLE IF NOT EXISTS translated_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id UUID NOT NULL REFERENCES post_translations(id) ON DELETE CASCADE,
    original_section_id UUID NOT NULL,
    template_id TEXT NOT NULL,
    title TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    position INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translated_sections_translation_id ON translated_sections(translation_id);
CREATE INDEX IF NOT EXISTS idx_translated_sections_original_section_id ON translated_sections(original_section_id);
CREATE INDEX IF NOT EXISTS idx_translated_sections_template_id ON translated_sections(template_id);
CREATE INDEX IF NOT EXISTS idx_translated_sections_position ON translated_sections(position);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_translated_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_translated_sections_updated_at
    BEFORE UPDATE ON translated_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_translated_sections_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE translated_sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON translated_sections
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON translated_sections
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON translated_sections
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON translated_sections
    FOR DELETE USING (auth.role() = 'authenticated');