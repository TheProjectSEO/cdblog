-- Create homepage settings table
CREATE TABLE IF NOT EXISTS homepage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default homepage settings
INSERT INTO homepage_settings (key, value) VALUES 
('hero_title', '{"text": "Travel like you''ve never traveled", "highlight": "never traveled"}'),
('hero_subtitle', '{"text": "Discover amazing destinations with our curated collection of 1565+ travel guides, hidden gems, and insider experiences."}'),
('hero_badge', '{"text": "✨ Your AI-powered travel companion"}'),
('hero_background', '{"url": "/placeholder.svg?height=800&width=1200", "alt": "Beautiful travel destinations"}'),
('logo_url', '{"url": "/cuddlynest-logo.png", "alt": "CuddlyNest"}'),
('stats', '{"guides": "1565+", "destinations": "200+", "for_text": "For every traveler"}'),
('featured_posts', '{"post_ids": []}'),
('site_settings', '{"google_translate_api_key": null}')
ON CONFLICT (key) DO NOTHING;

-- Create API keys table for secure storage
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(100) NOT NULL,
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on service for active keys
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_service_active 
ON api_keys (service) WHERE is_active = true;