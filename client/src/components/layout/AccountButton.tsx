import { useEffect, useRef, useState, type FormEvent } from "react"
import { CircleUserRound, LoaderCircle, LogIn, LogOut, X } from "lucide-react"
import { useAuth } from "@/auth/useAuth"

const returnPathKey = "lucea-auth-return-path"

const AccountButton = () => {
    const { user, isAuthConfigured, isAuthLoading, supabase } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const dialogRef = useRef<HTMLDialogElement>(null)

    const signInWithGoogle = async () => {
        if (!supabase) {
            setError("Authentication is not configured. Set the Supabase client variables in client/.env.")
            return
        }

        setIsSubmitting(true)
        setError("")
        setMessage("")
        try {
            const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
            sessionStorage.setItem(returnPathKey, returnPath)
            const redirectTo = new URL("/auth/callback", window.location.origin).toString()
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo },
            })
            if (oauthError) throw oauthError
        } catch (oauthError) {
            sessionStorage.removeItem(returnPathKey)
            setError(oauthError instanceof Error ? oauthError.message : "Unable to start Google sign-in.")
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (isOpen && !dialog.open) dialog.showModal()
        if (!isOpen && dialog.open) dialog.close()
    }, [isOpen])

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!supabase) {
            setError("Authentication is not configured. Set the Supabase client variables in client/.env.")
            return
        }

        setIsSubmitting(true)
        setError("")
        setMessage("")
        try {
            const result = isSignUp
                ? await supabase.auth.signUp({ email: email.trim(), password })
                : await supabase.auth.signInWithPassword({ email: email.trim(), password })
            if (result.error) throw result.error

            if (isSignUp && !result.data.session) {
                setMessage("Check your email to confirm your account, then sign in.")
            } else {
                setIsOpen(false)
                setPassword("")
            }
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Unable to authenticate.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const signOut = async () => {
        if (!supabase) return
        setIsSubmitting(true)
        setError("")
        try {
            const { error: signOutError } = await supabase.auth.signOut()
            if (signOutError) throw signOutError
            setIsOpen(false)
        } catch (signOutError) {
            setError(signOutError instanceof Error ? signOutError.message : "Unable to sign out.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <button
                type="button"
                aria-label={user ? `Account: ${user.email}` : "Sign in"}
                title={user?.email ?? "Sign in"}
                disabled={isAuthLoading}
                className="grid size-[42px] shrink-0 place-items-center rounded-full border border-black/20 text-neutral-600 transition hover:bg-black/[0.04] hover:text-neutral-900 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                onClick={() => {
                    setError("")
                    setMessage("")
                    setIsOpen(true)
                }}
            >
                {isAuthLoading
                    ? <LoaderCircle size={19} className="animate-spin" aria-hidden="true" />
                    : user
                        ? <CircleUserRound size={20} aria-hidden="true" />
                        : <LogIn size={19} aria-hidden="true" />
                }
            </button>

            {isOpen && (
                <dialog
                    ref={dialogRef}
                    aria-labelledby="account-dialog-title"
                    className="fixed inset-0 m-auto w-[min(92vw,26rem)] rounded-3xl border border-black/10 bg-[#fdfcfb] p-0 text-neutral-800 shadow-2xl backdrop:bg-neutral-950/45 backdrop:backdrop-blur-[2px]"
                    onCancel={event => {
                        event.preventDefault()
                        setIsOpen(false)
                    }}
                    onClose={() => setIsOpen(false)}
                >
                    <div className="p-5 sm:p-6">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 id="account-dialog-title" className="text-xl font-semibold">
                                    {user ? "Your account" : isSignUp ? "Create your account" : "Welcome back"}
                                </h2>
                                <p className="mt-1 text-sm text-neutral-500">
                                    {user ? "Your moodboards sync across devices." : "Sign in to sync your moodboards."}
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close dialog"
                                className="rounded-full p-2 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        {user ? (
                            <div>
                                <p className="break-all rounded-xl bg-black/[0.035] px-4 py-3 text-sm text-neutral-700">{user.email}</p>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 px-4 text-sm font-medium transition hover:bg-black/[0.04] disabled:opacity-60"
                                    onClick={() => void signOut()}
                                >
                                    {isSubmitting
                                        ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                                        : <LogOut size={16} aria-hidden="true" />
                                    }
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <>
                                {!isAuthConfigured && (
                                    <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900" role="status">
                                        Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `client/.env` to enable accounts.
                                    </p>
                                )}
                                <button
                                    type="button"
                                    disabled={isSubmitting || !isAuthConfigured}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-black/[0.025] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                    onClick={() => void signInWithGoogle()}
                                >
                                    {isSubmitting
                                        ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                                        : <GoogleMark />
                                    }
                                    Continue with Google
                                </button>
                                <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                                    <span className="h-px flex-1 bg-black/[0.08]" />
                                    or with email
                                    <span className="h-px flex-1 bg-black/[0.08]" />
                                </div>
                                <form onSubmit={event => void submit(event)} className="space-y-3">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Email
                                        <input
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={event => setEmail(event.target.value)}
                                            className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                                        />
                                    </label>
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Password
                                        <input
                                            type="password"
                                            required
                                            minLength={8}
                                            autoComplete={isSignUp ? "new-password" : "current-password"}
                                            value={password}
                                            onChange={event => setPassword(event.target.value)}
                                            className="mt-1.5 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                                        />
                                    </label>
                                    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                                    {message && <p role="status" className="text-sm text-neutral-600">{message}</p>}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isAuthConfigured}
                                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                    >
                                        {isSubmitting && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
                                        {isSignUp ? "Create account" : "Sign in"}
                                    </button>
                                </form>
                                <button
                                    type="button"
                                    className="mt-4 min-h-9 w-full text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
                                    onClick={() => {
                                        setIsSignUp(value => !value)
                                        setError("")
                                        setMessage("")
                                    }}
                                >
                                    {isSignUp ? "Already have an account? Sign in" : "New to Lucea? Create an account"}
                                </button>
                            </>
                        )}
                        {error && user && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
                    </div>
                </dialog>
            )}
        </>
    )
}

const GoogleMark = () => (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[18px]">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
        <path fill="#4285F4" d="M47.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h13.5c-.6 2.96-2.27 5.48-4.77 7.18l7.73 5.99c4.51-4.16 7.52-10.29 7.52-17.64Z" />
        <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.81l-7.72-5.99c-2.14 1.44-4.89 2.3-8.19 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
)

export default AccountButton
