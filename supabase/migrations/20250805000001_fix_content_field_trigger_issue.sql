-- Fix the content field trigger issue
-- This migration adds the missing 'content' field that a database trigger is expecting

-- Add the missing content field to modern_posts table
ALTER TABLE modern_posts 
ADD COLUMN IF NOT EXISTS content TEXT DEFAULT NULL;

-- Add a comment explaining this field
COMMENT ON COLUMN modern_posts.content IS 'Legacy content field required by database trigger. Use modern_post_sections for actual content.';

-- Optionally, we could also create a view or function to populate this field
-- from the modern_post_sections table, but for now just having the field should fix the trigger issue