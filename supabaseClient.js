import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.PROJECT_URL; // Replace with your Supabase project URL
const supabaseAnonKey = process.env.API_KEY; // Replace with your Supabase anon key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
