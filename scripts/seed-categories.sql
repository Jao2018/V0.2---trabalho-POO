-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Clothing', 'Apparel and fashion items'),
  ('Home & Garden', 'Home improvement and garden supplies'),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear'),
  ('Books & Media', 'Books, music, movies, and games'),
  ('Food & Beverages', 'Food products and drinks'),
  ('Health & Beauty', 'Health products and beauty items'),
  ('Toys & Games', 'Toys and gaming products'),
  ('Automotive', 'Car parts and accessories'),
  ('Miscellaneous', 'Other products')
ON CONFLICT DO NOTHING;

-- Insert criteria for Electronics
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Build Quality', 1.0, 10 FROM categories WHERE name = 'Electronics'
UNION ALL
SELECT id, 'Functionality', 1.2, 10 FROM categories WHERE name = 'Electronics'
UNION ALL
SELECT id, 'Design', 0.8, 10 FROM categories WHERE name = 'Electronics'
UNION ALL
SELECT id, 'Value for Money', 1.0, 10 FROM categories WHERE name = 'Electronics';

-- Insert criteria for Clothing
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Material Quality', 1.0, 10 FROM categories WHERE name = 'Clothing'
UNION ALL
SELECT id, 'Fit & Comfort', 1.2, 10 FROM categories WHERE name = 'Clothing'
UNION ALL
SELECT id, 'Design & Style', 1.0, 10 FROM categories WHERE name = 'Clothing'
UNION ALL
SELECT id, 'Durability', 0.8, 10 FROM categories WHERE name = 'Clothing';

-- Insert criteria for Home & Garden
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Quality', 1.0, 10 FROM categories WHERE name = 'Home & Garden'
UNION ALL
SELECT id, 'Functionality', 1.2, 10 FROM categories WHERE name = 'Home & Garden'
UNION ALL
SELECT id, 'Aesthetics', 0.8, 10 FROM categories WHERE name = 'Home & Garden'
UNION ALL
SELECT id, 'Durability', 1.0, 10 FROM categories WHERE name = 'Home & Garden';

-- Insert criteria for Sports & Outdoors
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Performance', 1.3, 10 FROM categories WHERE name = 'Sports & Outdoors'
UNION ALL
SELECT id, 'Durability', 1.0, 10 FROM categories WHERE name = 'Sports & Outdoors'
UNION ALL
SELECT id, 'Comfort', 0.9, 10 FROM categories WHERE name = 'Sports & Outdoors'
UNION ALL
SELECT id, 'Value', 0.8, 10 FROM categories WHERE name = 'Sports & Outdoors';

-- Insert criteria for Books & Media
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Content Quality', 1.5, 10 FROM categories WHERE name = 'Books & Media'
UNION ALL
SELECT id, 'Presentation', 0.7, 10 FROM categories WHERE name = 'Books & Media'
UNION ALL
SELECT id, 'Value for Money', 0.8, 10 FROM categories WHERE name = 'Books & Media';

-- Insert criteria for Food & Beverages
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Taste', 1.5, 10 FROM categories WHERE name = 'Food & Beverages'
UNION ALL
SELECT id, 'Freshness', 1.3, 10 FROM categories WHERE name = 'Food & Beverages'
UNION ALL
SELECT id, 'Packaging', 0.7, 10 FROM categories WHERE name = 'Food & Beverages'
UNION ALL
SELECT id, 'Value', 0.5, 10 FROM categories WHERE name = 'Food & Beverages';

-- Insert criteria for Health & Beauty
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Effectiveness', 1.4, 10 FROM categories WHERE name = 'Health & Beauty'
UNION ALL
SELECT id, 'Ingredients', 1.1, 10 FROM categories WHERE name = 'Health & Beauty'
UNION ALL
SELECT id, 'Packaging', 0.6, 10 FROM categories WHERE name = 'Health & Beauty'
UNION ALL
SELECT id, 'Value', 0.9, 10 FROM categories WHERE name = 'Health & Beauty';

-- Insert criteria for Toys & Games
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Fun Factor', 1.4, 10 FROM categories WHERE name = 'Toys & Games'
UNION ALL
SELECT id, 'Safety', 1.3, 10 FROM categories WHERE name = 'Toys & Games'
UNION ALL
SELECT id, 'Durability', 1.0, 10 FROM categories WHERE name = 'Toys & Games'
UNION ALL
SELECT id, 'Educational Value', 0.7, 10 FROM categories WHERE name = 'Toys & Games';

-- Insert criteria for Automotive
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Quality', 1.2, 10 FROM categories WHERE name = 'Automotive'
UNION ALL
SELECT id, 'Compatibility', 1.3, 10 FROM categories WHERE name = 'Automotive'
UNION ALL
SELECT id, 'Performance', 1.2, 10 FROM categories WHERE name = 'Automotive'
UNION ALL
SELECT id, 'Value', 0.8, 10 FROM categories WHERE name = 'Automotive';

-- Insert criteria for Miscellaneous
INSERT INTO criteria (category_id, name, weight, max_score)
SELECT id, 'Quality', 1.0, 10 FROM categories WHERE name = 'Miscellaneous'
UNION ALL
SELECT id, 'Functionality', 1.0, 10 FROM categories WHERE name = 'Miscellaneous'
UNION ALL
SELECT id, 'Design', 0.8, 10 FROM categories WHERE name = 'Miscellaneous'
UNION ALL
SELECT id, 'Value for Money', 1.0, 10 FROM categories WHERE name = 'Miscellaneous';
