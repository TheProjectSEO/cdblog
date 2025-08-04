-- Add position column to translated_sections table for proper section ordering
ALTER TABLE translated_sections 
ADD COLUMN position INTEGER DEFAULT 0;

-- Update existing records to get position from original sections
UPDATE translated_sections 
SET position = (
  SELECT position 
  FROM modern_post_sections 
  WHERE modern_post_sections.id = translated_sections.original_section_id
)
WHERE original_section_id IS NOT NULL;

-- Create index on position for better query performance
CREATE INDEX idx_translated_sections_position ON translated_sections(translation_id, position);