import { createContext, useContext } from "react"
import type { SupabaseClient, User } from "@supabase/supabase-js"

export interface AuthContextValue {
    user: User | null
    isAuthConfigured: boolean
    isAuthLoading: boolean
    isAuthDialogOpen: boolean
    authPrompt: string | null
    openAuthDialog: (prompt?: string) => void
    closeAuthDialog: () => void
    supabase: SupabaseClient | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within AuthProvider.")
    return context
}
