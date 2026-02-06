
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://tpluulaxjahuhobdaxex.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbHV1bGF4amFodWhvYmRheGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTM2MjMsImV4cCI6MjA4NTc4OTYyM30.SWrMbidldQNoStWZAgFZWhrx3QRMuOwsn05Rr7nBz50';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
