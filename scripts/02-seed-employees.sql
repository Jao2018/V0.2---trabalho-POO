-- Insert demo employees for testing
INSERT INTO employees (email, name, role, store_location, password_hash, is_active) VALUES
('operator@store.com', 'John Smith', 'operator', 'Store A', 'demo', true),
('operator2@store.com', 'Maria Garcia', 'operator', 'Store B', 'demo', true),
('manager@store.com', 'David Johnson', 'manager', 'Store A', 'demo', true),
('admin@store.com', 'Alice Brown', 'admin', 'Headquarters', 'demo', true);

-- Insert demo categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Food & Beverage', 'Grocery and food products'),
('Home & Garden', 'Home goods and gardening supplies'),
('Sports & Outdoor', 'Sports equipment and outdoor gear');

-- Insert demo criteria
INSERT INTO criteria (category_id, name, weight, max_score) VALUES
(1, 'Product Condition', 0.25, 10),
(1, 'Packaging Quality', 0.25, 10),
(1, 'Display Arrangement', 0.25, 10),
(1, 'Pricing Accuracy', 0.25, 10),
(2, 'Fabric Quality', 0.3, 10),
(2, 'Color Accuracy', 0.2, 10),
(2, 'Size Labeling', 0.25, 10),
(2, 'Display Presentation', 0.25, 10),
(3, 'Freshness', 0.35, 10),
(3, 'Packaging Integrity', 0.3, 10),
(3, 'Shelf Organization', 0.2, 10),
(3, 'Expiration Date Visibility', 0.15, 10);

-- Insert demo products
INSERT INTO products (sku, name, category_id, barcode, description) VALUES
('ELEC-001', 'Wireless Headphones', 1, '123456789012', 'Premium noise-cancelling headphones'),
('ELEC-002', 'USB-C Cable 2m', 1, '123456789013', 'High-speed USB-C charging cable'),
('CLOTHING-001', 'Cotton T-Shirt', 2, '123456789014', 'Classic crew neck t-shirt'),
('CLOTHING-002', 'Denim Jeans', 2, '123456789015', 'Classic fit blue denim jeans'),
('FOOD-001', 'Organic Coffee Beans 500g', 3, '123456789016', 'Fair-trade organic coffee'),
('FOOD-002', 'Almond Butter', 3, '123456789017', 'Natural almond butter no sugar'),
('GARDEN-001', 'Potting Soil 10L', 4, '123456789018', 'Premium potting mix for plants'),
('GARDEN-002', 'Garden Gloves', 4, '123456789019', 'Durable waterproof garden gloves');
