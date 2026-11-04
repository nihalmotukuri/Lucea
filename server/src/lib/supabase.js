import { createClient } from "@supabase/supabase-js"

let supabaseClient
let supabaseAuthClient

export const isSupabaseAuthConfigured = () =>
    Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY)

export const isSupabaseConfigured = () =>
    isSupabaseAuthConfigured() && Boolean(process.env.SUPABASE_SECRET_KEY)

export const getSupabaseAuthClient = () => {
    if (!isSupabaseAuthConfigured()) {
        throw new Error("Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before using Supabase Auth.")
    }

    if (!supabaseAuthClient) {
        supabaseAuthClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_PUBLISHABLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } },
        )
    }

    return supabaseAuthClient
}

export const getSupabaseClient = () => {
    if (!isSupabaseConfigured()) {
        throw new Error(
            "Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY before using Supabase.",
        )
    }

    if (!supabaseClient) {
        supabaseClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SECRET_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        )
    }

    return supabaseClient
}
