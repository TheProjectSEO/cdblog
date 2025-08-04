-- Add template_name column to translated_sections table for proper section rendering
ALTER TABLE translated_sections 
ADD COLUMN template_name TEXT;

-- Update existing German translation sections with correct template names based on position and data structure
-- Position 0: Hero section (has title, location, subtitle, backgroundImage)
UPDATE translated_sections 
SET template_name = 'hero-section'
WHERE position = 0 
  AND translated_data::text LIKE '%"backgroundImage"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Position 1: Rich text content (has content key)
UPDATE translated_sections 
SET template_name = 'rich-text-content'
WHERE position = 1 
  AND translated_data::text LIKE '%"content"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Position 3: Why destination different (has reasons array)
UPDATE translated_sections 
SET template_name = 'why-destination-different'
WHERE position = 3 
  AND translated_data::text LIKE '%"reasons"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Position 4: Things to do cards (has activities array)
UPDATE translated_sections 
SET template_name = 'things-to-do-cards'
WHERE position = 4 
  AND translated_data::text LIKE '%"activities"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Position 5: Where to stay (has hotels array)
UPDATE translated_sections 
SET template_name = 'where-to-stay'
WHERE position = 5 
  AND translated_data::text LIKE '%"hotels"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Position 6 & 9: Starter pack section (has buttonUrl, buttonText)
UPDATE translated_sections 
SET template_name = 'starter-pack-section'
WHERE position IN (6, 9)
  AND translated_data::text LIKE '%"buttonUrl"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Position 7: FAQ section (has faqs array)
UPDATE translated_sections 
SET template_name = 'faq'
WHERE position = 7 
  AND translated_data::text LIKE '%"faqs"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Position 8: Internal links section (has links array)
UPDATE translated_sections 
SET template_name = 'internal-links-section'
WHERE position = 8 
  AND translated_data::text LIKE '%"links"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Position 10: Author scroll badge (has authorName, updatedDate, publishedDate)
UPDATE translated_sections 
SET template_name = 'author-scroll-badge'
WHERE position = 10 
  AND translated_data::text LIKE '%"authorName"%'
  AND translation_id IN (
    SELECT id FROM post_translations WHERE language_code = 'de'
  );

-- Create index on template_name for better query performance
CREATE INDEX idx_translated_sections_template_name ON translated_sections(template_name);