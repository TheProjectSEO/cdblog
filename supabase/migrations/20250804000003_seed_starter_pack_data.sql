-- Insert sample starter pack data for demonstration
-- Note: You'll need to replace the post_id values with actual post IDs from your modern_posts table

-- First, let's create a few sample posts if they don't exist (for demo purposes)
-- In production, you would use actual post IDs

-- Sample starter pack for Naples & Amalfi Coast
DO $$
DECLARE
  sample_post_id UUID;
  starter_pack_id UUID;
BEGIN
  -- Try to find an existing post or create a sample one
  SELECT id INTO sample_post_id 
  FROM modern_posts 
  WHERE slug LIKE '%naples%' OR slug LIKE '%amalfi%' 
  LIMIT 1;
  
  -- If no existing post found, you would insert your actual post ID here
  -- For now, we'll use a placeholder UUID that you should replace
  IF sample_post_id IS NULL THEN
    sample_post_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
  
  -- Insert the starter pack section
  SELECT insert_starter_pack_section(
    sample_post_id,
    '🌊 Your Southern Italy starter pack',
    'Why Naples & Amalfi Coast Hits Different',
    'From ancient pizza traditions to dramatic coastal drives, this region offers an intoxicating blend of history, culture, and natural beauty that''ll leave you planning your next visit before you''ve even left.',
    1,
    '[
      {
        "icon": "🍕",
        "title": "Pizza Birthplace",
        "value": "1889",
        "description": "When Margherita pizza was first created in Naples",
        "order_index": 0
      },
      {
        "icon": "🏛️",
        "title": "UNESCO Sites",
        "value": "3",
        "description": "Historic centers and archaeological wonders",
        "order_index": 1
      },
      {
        "icon": "🚗",
        "title": "Coastal Drive",
        "value": "50km",
        "description": "Of breathtaking Amalfi Coast scenery",
        "order_index": 2
      },
      {
        "icon": "🏖️",
        "title": "Beach Towns",
        "value": "13+",
        "description": "Charming coastal villages to explore",
        "order_index": 3
      }
    ]'::jsonb,
    '[
      {
        "title": "Ancient Meets Modern",
        "content": "<p>Naples seamlessly blends 2,800 years of history with vibrant contemporary culture. Walk through narrow medieval streets where laundry hangs between ancient buildings, then discover world-class museums housing treasures from Pompeii and Herculaneum.</p>",
        "order_index": 0
      },
      {
        "title": "Coastal Paradise",
        "content": "<p>The Amalfi Coast delivers some of Italy''s most dramatic scenery. Colorful villages cling to cliffsides, luxury hotels overlook azure waters, and every curve in the coastal road reveals another postcard-perfect vista that''ll have you reaching for your camera.</p>",
        "order_index": 1
      }
    ]'::jsonb
  ) INTO starter_pack_id;
  
  RAISE NOTICE 'Created starter pack with ID: %', starter_pack_id;
END $$;

-- Sample starter pack for Rome
DO $$
DECLARE
  sample_post_id UUID;
  starter_pack_id UUID;
BEGIN
  SELECT id INTO sample_post_id 
  FROM modern_posts 
  WHERE slug LIKE '%rome%' 
  LIMIT 1;
  
  IF sample_post_id IS NULL THEN
    sample_post_id := '00000000-0000-0000-0000-000000000002'::uuid;
  END IF;
  
  SELECT insert_starter_pack_section(
    sample_post_id,
    '🏛️ Your Rome starter pack',
    'Why Rome Never Gets Old',
    'The Eternal City offers layers of history at every turn, from ancient Roman ruins to Renaissance masterpieces, all while serving some of the world''s best cuisine.',
    1,
    '[
      {
        "icon": "🏟️",
        "title": "Colosseum Age",
        "value": "2000+",
        "description": "Years of gladiatorial history",
        "order_index": 0
      },
      {
        "icon": "🎨",
        "title": "Vatican Museums",
        "value": "54",
        "description": "Galleries of priceless art",
        "order_index": 1
      },
      {
        "icon": "⛲",
        "title": "Fountains",
        "value": "280+",
        "description": "Beautiful fountains throughout the city",
        "order_index": 2
      },
      {
        "icon": "🍝",
        "title": "Pasta Types",
        "value": "20+",
        "description": "Traditional Roman pasta dishes",
        "order_index": 3
      }
    ]'::jsonb,
    '[
      {
        "title": "Living History",
        "content": "<p>Rome is a city where ancient history comes alive around every corner. Walk the same streets as Caesar, marvel at the engineering of the Pantheon, and throw a coin in the Trevi Fountain to ensure your return to this magical city.</p>",
        "order_index": 0
      },
      {
        "title": "Culinary Capital",
        "content": "<p>Roman cuisine is simple yet sublime. From carbonara to cacio e pepe, each dish tells a story of tradition passed down through generations. Don''t miss the local markets and family-run trattorias for the most authentic experience.</p>",
        "order_index": 1
      }
    ]'::jsonb
  ) INTO starter_pack_id;
  
  RAISE NOTICE 'Created Rome starter pack with ID: %', starter_pack_id;
END $$;

-- Sample starter pack for Tuscany
DO $$
DECLARE
  sample_post_id UUID;
  starter_pack_id UUID;
BEGIN
  SELECT id INTO sample_post_id 
  FROM modern_posts 
  WHERE slug LIKE '%tuscany%' OR slug LIKE '%florence%' 
  LIMIT 1;
  
  IF sample_post_id IS NULL THEN
    sample_post_id := '00000000-0000-0000-0000-000000000003'::uuid;
  END IF;
  
  SELECT insert_starter_pack_section(
    sample_post_id,
    '🍷 Your Tuscany starter pack',
    'Why Tuscany Captures Hearts',
    'Rolling hills dotted with cypress trees, world-class wines, Renaissance art, and charming medieval towns make Tuscany the epitome of Italian beauty and culture.',
    1,
    '[
      {
        "icon": "🍷",
        "title": "Wine Regions",
        "value": "8",
        "description": "Major wine-producing areas including Chianti",
        "order_index": 0
      },
      {
        "icon": "🖼️",
        "title": "Renaissance Art",
        "value": "1000s",
        "description": "Masterpieces in Florence museums",
        "order_index": 1
      },
      {
        "icon": "🏰",
        "title": "Hill Towns",
        "value": "15+",
        "description": "Perfectly preserved medieval villages",
        "order_index": 2
      },
      {
        "icon": "🫒",
        "title": "Olive Groves",
        "value": "92K",
        "description": "Hectares of olive cultivation",
        "order_index": 3
      }
    ]'::jsonb,
    '[
      {
        "title": "Renaissance Heartland",
        "content": "<p>Florence and Tuscany gave birth to the Renaissance, and you can still feel that creative energy today. From Michelangelo''s David to the Uffizi Gallery, art lovers will find themselves in paradise surrounded by humanity''s greatest masterpieces.</p>",
        "order_index": 0
      },
      {
        "title": "Wine & Dine",
        "content": "<p>Tuscan cuisine celebrates simplicity and quality ingredients. Pair hearty ribollita soup with a glass of Chianti Classico, or savor wild boar ragu while watching the sunset over vineyard-covered hills. Every meal is a celebration of the good life.</p>",
        "order_index": 1
      }
    ]'::jsonb
  ) INTO starter_pack_id;
  
  RAISE NOTICE 'Created Tuscany starter pack with ID: %', starter_pack_id;
END $$;

-- Add more sample data for different destinations
-- You can customize these for your specific blog posts

COMMENT ON TABLE starter_pack_sections IS 'Stores starter pack information for blog posts';
COMMENT ON TABLE starter_pack_highlights IS 'Stores highlight cards for starter pack sections';
COMMENT ON TABLE starter_pack_features IS 'Stores feature descriptions for starter pack sections';