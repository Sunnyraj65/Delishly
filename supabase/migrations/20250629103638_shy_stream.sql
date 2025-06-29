/*
  # Initial Schema Setup for FreshCut Delivery

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `target_weight` (real)
      - `actual_weight` (real)
      - `price_per_kg` (real)
      - `total_price` (real)
      - `images` (jsonb)
      - `video_url` (text, optional)
      - `grade` (text, optional)
      - `farm` (text, optional)
      - `status` (text, default 'draft')
      - `stock_count` (integer, default 1)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)
    - `orders`
      - `id` (uuid, primary key)
      - `items` (jsonb)
      - `total` (real)
      - `status` (text, default 'pending')
      - `customer_id` (uuid, foreign key to auth.users)
      - `customer_info` (jsonb, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access for categories and live products
    - User-specific access for orders
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_weight real NOT NULL,
  actual_weight real NOT NULL,
  price_per_kg real NOT NULL,
  total_price real NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  video_url text,
  grade text,
  farm text,
  status text DEFAULT 'draft',
  stock_count integer DEFAULT 1,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb NOT NULL,
  total real NOT NULL,
  status text DEFAULT 'pending',
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_info jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, authenticated write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true);

-- Products policies (public read for live products, authenticated write)
CREATE POLICY "Live products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (status = 'live');

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Orders policies (users can only see their own orders)
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

-- Insert sample categories
INSERT INTO categories (name) VALUES 
  ('Chicken'),
  ('Fish')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
DO $$
DECLARE
  chicken_category_id uuid;
  fish_category_id uuid;
BEGIN
  SELECT id INTO chicken_category_id FROM categories WHERE name = 'Chicken';
  SELECT id INTO fish_category_id FROM categories WHERE name = 'Fish';
  
  -- Sample chicken products
  INSERT INTO products (name, target_weight, actual_weight, price_per_kg, total_price, images, grade, farm, status, stock_count, category_id) VALUES
    ('Farm Fresh Chicken', 1.2, 1.18, 180, 212.40, '["https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400"]'::jsonb, 'Premium', 'Farm A', 'live', 15, chicken_category_id),
    ('Organic Chicken', 1.4, 1.42, 200, 284.00, '["https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400"]'::jsonb, 'Grade A', 'Farm B', 'live', 8, chicken_category_id),
    ('Free Range Chicken', 1.6, 1.58, 180, 284.40, '["https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400"]'::jsonb, 'Premium', 'Farm C', 'live', 12, chicken_category_id),
    ('Country Chicken', 1.8, 1.82, 220, 400.40, '["https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400"]'::jsonb, 'Grade A', 'Farm D', 'live', 3, chicken_category_id);
  
  -- Sample fish products
  INSERT INTO products (name, target_weight, actual_weight, price_per_kg, total_price, images, grade, farm, status, stock_count, category_id) VALUES
    ('Fresh Pomfret', 1.2, 1.15, 299, 344.85, '["https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=400"]'::jsonb, 'Premium', 'Coastal Farm A', 'live', 6, fish_category_id),
    ('Sea Bass', 1.4, 1.38, 350, 483.00, '["https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=400"]'::jsonb, 'Grade A', 'Coastal Farm B', 'live', 10, fish_category_id),
    ('Fresh Kingfish', 1.6, 1.62, 299, 484.38, '["https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=400"]'::jsonb, 'Premium', 'Coastal Farm C', 'live', 14, fish_category_id),
    ('Red Snapper', 1.8, 1.75, 320, 560.00, '["https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=400"]'::jsonb, 'Grade A', 'Coastal Farm D', 'live', 7, fish_category_id);
END $$;