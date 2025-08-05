-- Create table for UI translations
CREATE TABLE IF NOT EXISTS ui_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  translated_strings JSONB NOT NULL DEFAULT '{}',
  translation_status VARCHAR(20) DEFAULT 'pending' CHECK (translation_status IN ('pending', 'translating', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per language
  UNIQUE(language_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ui_translations_language ON ui_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_ui_translations_status ON ui_translations(translation_status);

-- Enable RLS
ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - allow public read access for translations
CREATE POLICY "Allow public read access to UI translations" ON ui_translations
  FOR SELECT USING (true);

-- Create RLS policy - allow authenticated users to manage translations
CREATE POLICY "Allow authenticated users to manage UI translations" ON ui_translations
  FOR ALL USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_ui_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ui_translations_updated_at
  BEFORE UPDATE ON ui_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_ui_translations_updated_at();