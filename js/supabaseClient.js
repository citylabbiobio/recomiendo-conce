import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY} from "./secrets.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);