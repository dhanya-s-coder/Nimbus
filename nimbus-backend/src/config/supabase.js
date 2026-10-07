import { createClient } from '@supabase/supabase-js';

let client;

/** Server-side Supabase client (secret/service-role key). Never expose this key to the frontend. */
export const getSupabase = () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) {
        const err = new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
        err.status = 503;
        throw err;
    }
    if (!client) client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return client;
};

export const isSupabaseConfigured = () =>
    !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY));
