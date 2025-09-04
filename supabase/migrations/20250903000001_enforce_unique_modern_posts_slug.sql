-- Enforce unique slugs for active posts to prevent duplicates resurfacing
-- Requires that duplicates have been archived or removed beforehand

-- Ensure status column only allows expected values
ALTER TABLE modern_posts
  ADD CONSTRAINT modern_posts_status_check
  CHECK (status IN ('draft','published','archived'));

-- Create a partial unique index so archived posts can retain old slugs if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uniq_modern_posts_slug_active'
  ) THEN
    CREATE UNIQUE INDEX uniq_modern_posts_slug_active
    ON modern_posts (slug)
    WHERE status <> 'archived';
  END IF;
END$$;

