-- Create starter pack sections table
CREATE TABLE IF NOT EXISTS starter_pack_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES modern_posts(id) ON DELETE CASCADE,
  
  -- Basic section information
  badge TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Metadata
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create highlight cards table for starter pack sections
CREATE TABLE IF NOT EXISTS starter_pack_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starter_pack_id UUID NOT NULL REFERENCES starter_pack_sections(id) ON DELETE CASCADE,
  
  -- Card content
  icon TEXT NOT NULL, -- Icon name or emoji
  title TEXT NOT NULL,
  value TEXT NOT NULL, -- The main value/stat to display
  description TEXT NOT NULL,
  
  -- Positioning
  order_index INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature sections table for starter pack sections
CREATE TABLE IF NOT EXISTS starter_pack_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starter_pack_id UUID NOT NULL REFERENCES starter_pack_sections(id) ON DELETE CASCADE,
  
  -- Feature content
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML content paragraphs
  
  -- Positioning
  order_index INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_starter_pack_sections_post_id ON starter_pack_sections(post_id);
CREATE INDEX IF NOT EXISTS idx_starter_pack_sections_position ON starter_pack_sections(post_id, position);
CREATE INDEX IF NOT EXISTS idx_starter_pack_sections_active ON starter_pack_sections(is_active);

CREATE INDEX IF NOT EXISTS idx_starter_pack_highlights_starter_pack_id ON starter_pack_highlights(starter_pack_id);
CREATE INDEX IF NOT EXISTS idx_starter_pack_highlights_order ON starter_pack_highlights(starter_pack_id, order_index);

CREATE INDEX IF NOT EXISTS idx_starter_pack_features_starter_pack_id ON starter_pack_features(starter_pack_id);
CREATE INDEX IF NOT EXISTS idx_starter_pack_features_order ON starter_pack_features(starter_pack_id, order_index);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_starter_pack_sections_updated_at 
  BEFORE UPDATE ON starter_pack_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starter_pack_highlights_updated_at 
  BEFORE UPDATE ON starter_pack_highlights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_starter_pack_features_updated_at 
  BEFORE UPDATE ON starter_pack_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get complete starter pack data for a post
CREATE OR REPLACE FUNCTION get_starter_pack_for_post(post_id_param UUID)
RETURNS TABLE (
  section_id UUID,
  section_badge TEXT,
  section_title TEXT,
  section_description TEXT,
  section_position INTEGER,
  highlights JSONB,
  features JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sps.id,
    sps.badge,
    sps.title,
    sps.description,
    sps.position,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', sph.id,
          'icon', sph.icon,
          'title', sph.title,
          'value', sph.value,
          'description', sph.description,
          'order_index', sph.order_index
        ) ORDER BY sph.order_index
      )
      FROM starter_pack_highlights sph 
      WHERE sph.starter_pack_id = sps.id),
      '[]'::jsonb
    ) as highlights,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', spf.id,
          'title', spf.title,
          'content', spf.content,
          'order_index', spf.order_index
        ) ORDER BY spf.order_index
      )
      FROM starter_pack_features spf 
      WHERE spf.starter_pack_id = sps.id),
      '[]'::jsonb
    ) as features
  FROM starter_pack_sections sps
  WHERE sps.post_id = post_id_param
    AND sps.is_active = true
  ORDER BY sps.position;
END;
$$;

-- Create function to insert complete starter pack data
CREATE OR REPLACE FUNCTION insert_starter_pack_section(
  post_id_param UUID,
  badge_param TEXT,
  title_param TEXT,
  description_param TEXT,
  position_param INTEGER DEFAULT 0,
  highlights_param JSONB DEFAULT '[]'::jsonb,
  features_param JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  starter_pack_id UUID;
  highlight_item JSONB;
  feature_item JSONB;
BEGIN
  -- Insert the main starter pack section
  INSERT INTO starter_pack_sections (post_id, badge, title, description, position)
  VALUES (post_id_param, badge_param, title_param, description_param, position_param)
  RETURNING id INTO starter_pack_id;
  
  -- Insert highlights if provided
  IF jsonb_array_length(highlights_param) > 0 THEN
    FOR highlight_item IN SELECT jsonb_array_elements(highlights_param)
    LOOP
      INSERT INTO starter_pack_highlights (
        starter_pack_id, 
        icon, 
        title, 
        value, 
        description, 
        order_index
      )
      VALUES (
        starter_pack_id,
        highlight_item->>'icon',
        highlight_item->>'title',
        highlight_item->>'value',
        highlight_item->>'description',
        COALESCE((highlight_item->>'order_index')::integer, 0)
      );
    END LOOP;
  END IF;
  
  -- Insert features if provided
  IF jsonb_array_length(features_param) > 0 THEN
    FOR feature_item IN SELECT jsonb_array_elements(features_param)
    LOOP
      INSERT INTO starter_pack_features (
        starter_pack_id, 
        title, 
        content, 
        order_index
      )
      VALUES (
        starter_pack_id,
        feature_item->>'title',
        feature_item->>'content',
        COALESCE((feature_item->>'order_index')::integer, 0)
      );
    END LOOP;
  END IF;
  
  RETURN starter_pack_id;
END;
$$;

-- Create function to update starter pack section
CREATE OR REPLACE FUNCTION update_starter_pack_section(
  starter_pack_id_param UUID,
  badge_param TEXT DEFAULT NULL,
  title_param TEXT DEFAULT NULL,
  description_param TEXT DEFAULT NULL,
  position_param INTEGER DEFAULT NULL,
  highlights_param JSONB DEFAULT NULL,
  features_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  highlight_item JSONB;
  feature_item JSONB;
BEGIN
  -- Update main section if parameters provided
  UPDATE starter_pack_sections 
  SET 
    badge = COALESCE(badge_param, badge),
    title = COALESCE(title_param, title),
    description = COALESCE(description_param, description),
    position = COALESCE(position_param, position),
    updated_at = NOW()
  WHERE id = starter_pack_id_param;
  
  -- Update highlights if provided
  IF highlights_param IS NOT NULL THEN
    -- Delete existing highlights
    DELETE FROM starter_pack_highlights WHERE starter_pack_id = starter_pack_id_param;
    
    -- Insert new highlights
    FOR highlight_item IN SELECT jsonb_array_elements(highlights_param)
    LOOP
      INSERT INTO starter_pack_highlights (
        starter_pack_id, 
        icon, 
        title, 
        value, 
        description, 
        order_index
      )
      VALUES (
        starter_pack_id_param,
        highlight_item->>'icon',
        highlight_item->>'title',
        highlight_item->>'value',
        highlight_item->>'description',
        COALESCE((highlight_item->>'order_index')::integer, 0)
      );
    END LOOP;
  END IF;
  
  -- Update features if provided
  IF features_param IS NOT NULL THEN
    -- Delete existing features
    DELETE FROM starter_pack_features WHERE starter_pack_id = starter_pack_id_param;
    
    -- Insert new features
    FOR feature_item IN SELECT jsonb_array_elements(features_param)
    LOOP
      INSERT INTO starter_pack_features (
        starter_pack_id, 
        title, 
        content, 
        order_index
      )
      VALUES (
        starter_pack_id_param,
        feature_item->>'title',
        feature_item->>'content',
        COALESCE((feature_item->>'order_index')::integer, 0)
      );
    END LOOP;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE starter_pack_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE starter_pack_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE starter_pack_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now, can be restricted later)
CREATE POLICY "Allow all operations on starter_pack_sections" ON starter_pack_sections FOR ALL USING (true);
CREATE POLICY "Allow all operations on starter_pack_highlights" ON starter_pack_highlights FOR ALL USING (true);
CREATE POLICY "Allow all operations on starter_pack_features" ON starter_pack_features FOR ALL USING (true);