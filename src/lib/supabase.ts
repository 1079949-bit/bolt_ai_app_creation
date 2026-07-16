import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  role: string;
  biography: string | null;
  image_url: string | null;
  github_username: string | null;
  interests: string | null;
  fun_fact: string | null;
  goal: string | null;
  created_at: string;
};

export type Biometrics = {
  id: string;
  weight_lbs: number | null;
  height_ft: number | null;
  height_in: number | null;
  sodium_mg: number;
  sugars_g: number;
  created_at: string;
  updated_at: string;
};

export type DailyTarget = {
  id: string;
  calories: number;
  protein_g: number;
  total_fat_g: number;
  carbs_g: number;
  fiber_g: number;
  created_at: string;
  updated_at: string;
};

export type VitaminTarget = {
  id: string;
  vitamin_a_mcg: number;
  vitamin_c_mcg: number;
  vitamin_d_mcg: number;
  vitamin_e_mg: number;
  vitamin_b12_mcg: number;
  created_at: string;
  updated_at: string;
};

export type FoodEntry = {
  id: string;
  name: string;
  health_score: number | null;
  reason: string | null;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  sugars_g: number;
  log_date: string;
  created_at: string;
};
