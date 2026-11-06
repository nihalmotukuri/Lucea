import { useEffect, useMemo, useState, type ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useMoodboards } from "@/store/useMoodboards"
import { AuthContext, type AuthContextValue } from "./useAuth"

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
    const [authPrompt, setAuthPrompt] = useState<string | null>(null)

    useEffect(() => {
        if (!supabase) {
            setIsAuthLoading(false)
            return
        }

        let isMounted = true
        const applySession = (nextSession: Session | null) => {
            if (!isMounted) return
            setSession(nextSession)
            if (nextSession?.user && nextSession.access_token) {
                void useMoodboards.getState().syncWithAccount(
                    nextSession.user.id,
                    nextSession.access_token,
                )
            } else {
                useMoodboards.getState().clearAccount()
            }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            applySession(nextSession)
            setIsAuthLoading(false)
        })

        void supabase.auth.getSession().then(({ data, error }) => {
            if (error) console.error("Unable to restore the Supabase session:", error)
            applySession(data.session)
            setIsAuthLoading(false)
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    const value = useMemo<AuthContextValue>(() => ({
        user: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        isAuthConfigured: supabase !== null,
        isAuthLoading,
        isAuthDialogOpen,
        authPrompt,
        openAuthDialog: (prompt?: string) => {
            setAuthPrompt(prompt ?? null)
            setIsAuthDialogOpen(true)
        },
        closeAuthDialog: () => {
            setAuthPrompt(null)
            setIsAuthDialogOpen(false)
        },
        supabase,
    }), [session, isAuthLoading, isAuthDialogOpen, authPrompt])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
