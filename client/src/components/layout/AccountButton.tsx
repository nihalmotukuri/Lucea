import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, BookmarkPlus, ChevronDown, CircleUserRound, LoaderCircle, LogIn, LogOut, Settings, Sparkles, UserRound, X } from "lucide-react"
import { useAuth } from "@/auth/useAuth"

const returnPathKey = "lucea-auth-return-path"

const AccountButton = () => {
    const {
        user,
        isAuthConfigured,
        isAuthLoading,
        isAuthDialogOpen,
        authPrompt,
        openAuthDialog,
        closeAuthDialog,
        supabase,
    } = useAuth()
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
        if (isAuthDialogOpen && !dialog.open) dialog.showModal()
        if (!isAuthDialogOpen && dialog.open) dialog.close()
    }, [isAuthDialogOpen])

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
                closeAuthDialog()
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
            closeAuthDialog()
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
                title={user ? "Your account" : "Sign in"}
                disabled={isAuthLoading}
                className="group relative flex h-10 md:h-12 shrink-0 items-center justify-center gap-1 rounded-xl px-1.5 text-neutral-500 transition-all duration-200 hover:bg-black/[0.035] hover:text-neutral-900 motion-safe:hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                onClick={() => {
                    setError("")
                    setMessage("")
                    openAuthDialog()
                }}
            >
                {isAuthLoading ? (
                    <LoaderCircle size={17} className="animate-spin text-neutral-500" aria-hidden="true" />
                ) : user ? (
                    <div className="flex items-center gap-1">
                        <div className="grid size-7 md:size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-amber-400 font-semibold text-[11px] md:text-xs text-amber-950 shadow-2xs select-none dark:from-amber-600 dark:to-amber-800 dark:text-amber-100">
                            {user.email ? user.email[0].toUpperCase() : <CircleUserRound size={16} aria-hidden="true" />}
                        </div>
                        <ChevronDown size={12} className="shrink-0 text-neutral-400 transition-transform duration-200 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-300 md:size-[14px]" aria-hidden="true" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 sm:px-1">
                        <LogIn size={16} strokeWidth={1.7} className="shrink-0 text-neutral-500 transition-colors group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white md:size-[18px]" aria-hidden="true" />
                        <span className="hidden sm:inline text-xs font-medium">Sign in</span>
                    </div>
                )}
            </button>

            {isAuthDialogOpen && (
                <dialog
                    ref={dialogRef}
                    aria-labelledby="account-dialog-title"
                    className="fixed inset-0 m-auto max-h-[min(92dvh,48rem)] w-[min(92vw,28rem)] overflow-y-auto rounded-[24px] border border-black/[0.08] bg-[#fdfcfb] p-0 text-neutral-800 shadow-[0_24px_80px_rgba(35,29,22,0.18)] backdrop:bg-black/60 backdrop:backdrop-blur-sm dark:border-white/[0.09] dark:bg-[#181615] dark:text-neutral-100"
                    onCancel={event => {
                        event.preventDefault()
                        closeAuthDialog()
                    }}
                    onClose={closeAuthDialog}
                >
                    <div className="p-6 sm:p-7">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f1ece5] text-neutral-700 dark:bg-[#282522] dark:text-neutral-200">
                                    {user
                                        ? <CircleUserRound size={20} aria-hidden="true" />
                                        : <BookmarkPlus size={20} aria-hidden="true" />
                                    }
                                </span>
                                <div className="pt-0.5">
                                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                                        {user ? "Your Lucea account" : "A little more inspiration"}
                                    </p>
                                    <h2 id="account-dialog-title" className="font-editorial text-2xl leading-tight text-neutral-800 dark:text-neutral-100 sm:text-[28px]">
                                        {user ? "Your account" : isSignUp ? "Make room for inspiration" : "Welcome back"}
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="Close dialog"
                                className="grid size-8 place-items-center rounded-full text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                                onClick={closeAuthDialog}
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        {user ? (
                            <div>
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">Currently in</p>
                                <div className="flex items-center gap-3.5 rounded-2xl border border-black/[0.06] bg-[#faf7f2] p-3.5 dark:border-white/[0.08] dark:bg-[#24211e]">
                                    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 font-semibold text-white shadow-sm">
                                        {user.email ? user.email[0].toUpperCase() : "U"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                            {user.email ? user.email.split("@")[0] : "Creator"}
                                        </p>
                                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-2">
                                    <Link
                                        to="/profile"
                                        onClick={closeAuthDialog}
                                        className="inline-flex min-h-11 items-center justify-between rounded-xl border border-black/[0.06] bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-black/[0.035] dark:border-white/[0.08] dark:bg-[#24211e] dark:text-neutral-200 dark:hover:bg-[#2c2824]"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <UserRound size={16} aria-hidden="true" />
                                            Public profile & creator page
                                        </span>
                                        <ArrowUpRight size={15} className="text-neutral-400" aria-hidden="true" />
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={closeAuthDialog}
                                        className="inline-flex min-h-11 items-center justify-between rounded-xl border border-black/[0.06] bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-black/[0.035] dark:border-white/[0.08] dark:bg-[#24211e] dark:text-neutral-200 dark:hover:bg-[#2c2824]"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <Settings size={16} aria-hidden="true" />
                                            Preferences & Settings
                                        </span>
                                        <ArrowUpRight size={15} className="text-neutral-400" aria-hidden="true" />
                                    </Link>
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        className="mt-1 inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-red-200/80 bg-red-50/50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100/70 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                                        onClick={() => void signOut()}
                                    >
                                        {isSubmitting
                                            ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                                            : <LogOut size={16} aria-hidden="true" />
                                        }
                                        Log out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="mb-4 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                                    {authPrompt ?? "Keep your favorite photos and videos together in moodboards you can revisit anytime."}
                                </p>
                                <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-[#f5f1eb] px-4 py-3 text-xs leading-5 text-neutral-600 dark:bg-[#24211e] dark:text-neutral-300">
                                    <Sparkles size={16} className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                                    <span>One account for your saved finds, wherever you sign in.</span>
                                </div>
                                {!isAuthConfigured && (
                                    <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="status">
                                        Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `client/.env` to enable accounts.
                                    </p>
                                )}
                                <div className="mb-4 grid grid-cols-2 rounded-2xl bg-[#eee8df] p-1 dark:bg-[#25221e]" role="group" aria-label="Account action">
                                    {([
                                        { value: false, label: "Sign in" },
                                        { value: true, label: "Create account" },
                                    ] as const).map(({ value, label }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            aria-pressed={isSignUp === value}
                                            className={`min-h-10 rounded-xl px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${
                                                isSignUp === value
                                                    ? "bg-white text-neutral-900 shadow-sm dark:bg-[#34302b] dark:text-white"
                                                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
                                            }`}
                                            onClick={() => {
                                                setIsSignUp(value)
                                                setError("")
                                                setMessage("")
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    disabled={isSubmitting || !isAuthConfigured}
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-black/[0.09] bg-white px-4 text-sm font-semibold text-neutral-750 shadow-2xs transition hover:border-black/20 hover:bg-[#faf7f2] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-white/10 dark:bg-[#24211e] dark:text-neutral-200 dark:hover:border-white/20 dark:hover:bg-[#2c2824]"
                                    onClick={() => void signInWithGoogle()}
                                >
                                    {isSubmitting
                                        ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                                        : <GoogleMark />
                                    }
                                    Continue with Google
                                </button>
                                <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                                    <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
                                    or with email
                                    <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
                                </div>
                                <form onSubmit={event => void submit(event)} className="space-y-4">
                                    <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-neutral-600 dark:text-neutral-400">
                                        Email
                                        <input
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            placeholder="you@example.com"
                                            onChange={event => setEmail(event.target.value)}
                                            className="mt-1.5 min-h-12 w-full rounded-2xl border border-black/[0.09] bg-white px-4 text-sm font-normal text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.04] dark:border-white/10 dark:bg-[#24211e] dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400 dark:focus:bg-[#25221e] dark:focus:ring-white/[0.04]"
                                        />
                                    </label>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-neutral-600 dark:text-neutral-400">
                                        Password
                                        <input
                                            type="password"
                                            required
                                            minLength={8}
                                            autoComplete={isSignUp ? "new-password" : "current-password"}
                                            value={password}
                                            placeholder="At least 8 characters"
                                            onChange={event => setPassword(event.target.value)}
                                            className="mt-1.5 min-h-12 w-full rounded-2xl border border-black/[0.09] bg-white px-4 text-sm font-normal text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.04] dark:border-white/10 dark:bg-[#24211e] dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400 dark:focus:bg-[#25221e] dark:focus:ring-white/[0.04]"
                                        />
                                    </label>
                                    {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
                                    {message && <p role="status" className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{message}</p>}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isAuthConfigured}
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                                    >
                                        {isSubmitting && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
                                        {isSignUp ? "Create account" : "Sign in"}
                                    </button>
                                </form>
                            </>
                        )}
                        {error && user && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p>}
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
