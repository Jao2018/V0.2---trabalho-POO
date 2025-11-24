-- Insert evaluation criteria with slider options for Food & Beverages category
-- This script adds typical evaluation criteria that will be used with sliders in the evaluation page

INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Pleasantness', 1.2, 10 FROM categories WHERE name = 'Food & Beverages'
UNION ALL
SELECT id, 'Comfort', 1.0, 10 FROM categories WHERE name = 'Food & Beverages'
UNION ALL
SELECT id, 'Freshness', 1.3, 10 FROM categories WHERE name = 'Food & Beverages'
UNION ALL
SELECT id, 'Taste Quality', 1.4, 10 FROM categories WHERE name = 'Food & Beverages'
UNION ALL
SELECT id, 'Packaging Quality', 0.8, 10 FROM categories WHERE name = 'Food & Beverages'
UNION ALL
SELECT id, 'Value for Money', 0.9, 10 FROM categories WHERE name = 'Food & Beverages'
ON CONFLICT DO NOTHING;

-- Add criteria for other categories as well
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Comfort', 1.2, 10 FROM categories WHERE name = 'Clothing'
UNION ALL
SELECT id, 'Pleasantness', 0.9, 10 FROM categories WHERE name = 'Clothing'
UNION ALL
SELECT id, 'Durability', 1.0, 10 FROM categories WHERE name = 'Clothing'
ON CONFLICT DO NOTHING;

INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Comfort', 1.3, 10 FROM categories WHERE name = 'Sports & Outdoors'
UNION ALL
SELECT id, 'Performance', 1.4, 10 FROM categories WHERE name = 'Sports & Outdoors'
UNION ALL
SELECT id, 'Pleasantness to Use', 0.9, 10 FROM categories WHERE name = 'Sports & Outdoors'
ON CONFLICT DO NOTHING;

INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Comfort', 1.1, 10 FROM categories WHERE name = 'Home & Garden'
UNION ALL
SELECT id, 'Aesthetics', 0.8, 10 FROM categories WHERE name = 'Home & Garden'
UNION ALL
SELECT id, 'Functionality', 1.2, 10 FROM categories WHERE name = 'Home & Garden'
ON CONFLICT DO NOTHING;
