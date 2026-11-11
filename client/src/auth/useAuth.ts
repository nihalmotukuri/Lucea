import { createContext, useContext } from "react"
import type { SupabaseClient, User } from "@supabase/supabase-js"

export interface AuthContextValue {
    user: User | null
    accessToken: string | null
    isAuthConfigured: boolean
    isAuthLoading: boolean
    isAuthDialogOpen: boolean
    authPrompt: string | null
    openAuthDialog: (prompt?: string) => void
    closeAuthDialog: () => void
    supabase: SupabaseClient | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const defaultAuthContext: AuthContextValue = {
    user: null,
    accessToken: null,
    isAuthConfigured: false,
    isAuthLoading: false,
    isAuthDialogOpen: false,
    authPrompt: null,
    openAuthDialog: () => {},
    closeAuthDialog: () => {},
    supabase: null,
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    return context ?? defaultAuthContext
}
