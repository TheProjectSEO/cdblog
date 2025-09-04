-- Fix author_id column type mismatch between modern_posts and authors tables
-- modern_posts.author_id was UUID but authors.id is TEXT

-- Step 1: Change author_id column type from UUID to TEXT
ALTER TABLE modern_posts 
ALTER COLUMN author_id TYPE TEXT;