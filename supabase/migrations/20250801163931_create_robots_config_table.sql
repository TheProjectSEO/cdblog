-- Create robots_config table for managing robots.txt content
CREATE TABLE IF NOT EXISTS robots_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries on active configs
CREATE INDEX IF NOT EXISTS idx_robots_config_active ON robots_config(is_active);

-- Insert default robots.txt content
INSERT INTO robots_config (content, is_active) VALUES (
'User-agent: *
Allow: /

# Sitemap
Sitemap: https://cuddlynest.com/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Crawl delay (optional)
Crawl-delay: 1',
true
) ON CONFLICT DO NOTHING;