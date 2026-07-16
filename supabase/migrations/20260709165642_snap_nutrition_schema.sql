/*
# SnapNutrition Database Schema

1. New Tables
- `profiles` - Team member profiles (Josiah, Yasmine, Jaceorion)
  - id (uuid, primary key)
  - name (text, not null)
  - role (text, not null)
  - biography (text)
  - image_url (text)
  - created_at (timestamp)
- `biometrics` - User health metrics
  - id (uuid, primary key)
  - weight_lbs (numeric)
  - height_ft (integer)
  - height_in (integer)
  - sodium_mg (integer)
  - sugars_g (integer)
  - created_at (timestamp)
  - updated_at (timestamp)
- `daily_targets` - Nutrition goals
  - id (uuid, primary key)
  - calories (integer)
  - protein_g (integer)
  - total_fat_g (integer)
  - carbs_g (integer)
  - fiber_g (integer)
  - created_at (timestamp)
  - updated_at (timestamp)
- `vitamin_targets` - Vitamin daily targets
  - id (uuid, primary key)
  - vitamin_a_mcg (integer)
  - vitamin_c_mcg (integer)
  - vitamin_d_mcg (integer)
  - vitamin_e_mg (integer)
  - vitamin_b12_mcg (numeric)
  - created_at (timestamp)
  - updated_at (timestamp)
- `food_entries` - Food log entries
  - id (uuid, primary key)
  - name (text, not null)
  - health_score (integer, 0-100)
  - reason (text)
  - meal_type (text: breakfast, lunch, dinner)
  - calories (integer)
  - protein_g (integer)
  - carbs_g (integer)
  - fat_g (integer)
  - fiber_g (integer)
  - sodium_mg (integer)
  - sugars_g (integer)
  - log_date (date)
  - created_at (timestamp)

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD because this is a single-tenant public app.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  biography text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS biometrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weight_lbs numeric,
  height_ft integer,
  height_in integer,
  sodium_mg integer DEFAULT 2000,
  sugars_g integer DEFAULT 120,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calories integer DEFAULT 2000,
  protein_g integer DEFAULT 150,
  total_fat_g integer DEFAULT 100,
  carbs_g integer DEFAULT 350,
  fiber_g integer DEFAULT 20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vitamin_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vitamin_a_mcg integer DEFAULT 900,
  vitamin_c_mcg integer DEFAULT 90,
  vitamin_d_mcg integer DEFAULT 15,
  vitamin_e_mg integer DEFAULT 15,
  vitamin_b12_mcg numeric DEFAULT 2.4,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  health_score integer CHECK (health_score >= 0 AND health_score <= 100),
  reason text,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  calories integer DEFAULT 0,
  protein_g integer DEFAULT 0,
  carbs_g integer DEFAULT 0,
  fat_g integer DEFAULT 0,
  fiber_g integer DEFAULT 0,
  sodium_mg integer DEFAULT 0,
  sugars_g integer DEFAULT 0,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitamin_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);

-- Biometrics policies
DROP POLICY IF EXISTS "anon_select_biometrics" ON biometrics;
CREATE POLICY "anon_select_biometrics" ON biometrics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_biometrics" ON biometrics;
CREATE POLICY "anon_insert_biometrics" ON biometrics FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_biometrics" ON biometrics;
CREATE POLICY "anon_update_biometrics" ON biometrics FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_biometrics" ON biometrics;
CREATE POLICY "anon_delete_biometrics" ON biometrics FOR DELETE
  TO anon, authenticated USING (true);

-- Daily targets policies
DROP POLICY IF EXISTS "anon_select_daily_targets" ON daily_targets;
CREATE POLICY "anon_select_daily_targets" ON daily_targets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_daily_targets" ON daily_targets;
CREATE POLICY "anon_insert_daily_targets" ON daily_targets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_daily_targets" ON daily_targets;
CREATE POLICY "anon_update_daily_targets" ON daily_targets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_daily_targets" ON daily_targets;
CREATE POLICY "anon_delete_daily_targets" ON daily_targets FOR DELETE
  TO anon, authenticated USING (true);

-- Vitamin targets policies
DROP POLICY IF EXISTS "anon_select_vitamin_targets" ON vitamin_targets;
CREATE POLICY "anon_select_vitamin_targets" ON vitamin_targets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vitamin_targets" ON vitamin_targets;
CREATE POLICY "anon_insert_vitamin_targets" ON vitamin_targets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vitamin_targets" ON vitamin_targets;
CREATE POLICY "anon_update_vitamin_targets" ON vitamin_targets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vitamin_targets" ON vitamin_targets;
CREATE POLICY "anon_delete_vitamin_targets" ON vitamin_targets FOR DELETE
  TO anon, authenticated USING (true);

-- Food entries policies
DROP POLICY IF EXISTS "anon_select_food_entries" ON food_entries;
CREATE POLICY "anon_select_food_entries" ON food_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_food_entries" ON food_entries;
CREATE POLICY "anon_insert_food_entries" ON food_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_food_entries" ON food_entries;
CREATE POLICY "anon_update_food_entries" ON food_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_food_entries" ON food_entries;
CREATE POLICY "anon_delete_food_entries" ON food_entries FOR DELETE
  TO anon, authenticated USING (true);

-- Insert default team profiles
INSERT INTO profiles (name, role, biography, image_url, github_username, interests, fun_fact, goal) VALUES
  ('Josiah', 'Lead Developer', 'Passionate about building health-focused applications that make a real difference in people''s lives. Loves clean code and innovative solutions.', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', 'Kellamsjosiah', 'Fishing on the beach, playing volleyball, cooking food', 'Has been to over 30 countries', 'To get into UCLA'),
  ('Yasmine', 'UI/UX Designer', 'Creative designer focused on making nutrition tracking beautiful and intuitive. Believes great design can inspire healthier choices.', NULL, 'yasminekey4', 'Drawing, lived in South Carolina, big fan of Michael Jackson, favorite color is purple', 'Lived in South Carolina', 'To learn more about HTML elements'),
  ('Jaceorion', 'Health & Nutrition Specialist', 'Hey, I''m Jacoreion Ogletree! I''m all about music and fashion — you''ll usually catch me putting together an outfit, discovering new artists, or just vibing to a good playlist. When I''m not doing that, I''m probably in the kitchen trying out new food. I''ve been to NYC and loved every second of it — the energy there is unmatched. My big goal right now is to perform at Rolling Loud one day. You can check out my code over on GitHub at c6or3y.', NULL, 'c6or3y', 'Music, fashion, food', 'Has been to NYC', 'Wants to perform at Rolling Loud')
ON CONFLICT DO NOTHING;

-- Insert default biometrics
INSERT INTO biometrics (weight_lbs, height_ft, height_in) VALUES (150, 5, 10)
ON CONFLICT DO NOTHING;

-- Insert default daily targets
INSERT INTO daily_targets DEFAULT VALUES ON CONFLICT DO NOTHING;

-- Insert default vitamin targets
INSERT INTO vitamin_targets DEFAULT VALUES ON CONFLICT DO NOTHING;

-- Insert sample food entries for demo
INSERT INTO food_entries (name, health_score, reason, meal_type, calories, protein_g, carbs_g, fat_g, fiber_g, log_date) VALUES
  ('Honey Nut Cheerios', 47, 'High in added sugars but contains whole grains and essential vitamins. Better than many sugary cereals but not optimal for daily breakfast.', 'breakfast', 150, 3, 30, 2, 3, CURRENT_DATE),
  ('2 Eggs', 93, 'Excellent source of high-quality protein and essential nutrients. Contains choline for brain health and is very satiating.', 'breakfast', 140, 12, 1, 10, 0, CURRENT_DATE),
  ('Turkey Ham and Cheese Sandwich', 62, 'Good protein content but processed turkey ham contains sodium and preservatives. Whole grain bread adds fiber.', 'lunch', 350, 25, 35, 15, 4, CURRENT_DATE),
  ('Diet Coke', 23, 'Zero calories but contains artificial sweeteners and phosphoric acid. No nutritional value and may disrupt gut health.', 'lunch', 0, 0, 0, 0, 0, CURRENT_DATE),
  ('New York Strip Steak', 82, 'High-quality protein with iron and B12. Moderate saturated fat, best enjoyed in reasonable portions.', 'dinner', 450, 35, 0, 32, 0, CURRENT_DATE),
  ('Roasted Potatoes', 85, 'Good source of potassium and vitamin C. Moderate glycemic index when roasted, provides sustained energy.', 'dinner', 200, 4, 35, 8, 4, CURRENT_DATE)
ON CONFLICT DO NOTHING;