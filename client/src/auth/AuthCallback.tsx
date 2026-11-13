import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LoaderCircle, RotateCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

const returnPathKey = "lucea-auth-return-path"

const getSafeReturnPath = () => {
    const storedPath = sessionStorage.getItem(returnPathKey)
    sessionStorage.removeItem(returnPathKey)
    return storedPath && storedPath.startsWith("/") && !storedPath.startsWith("//")
        ? storedPath
        : "/"
}

const AuthCallback = () => {
    const navigate = useNavigate()
    const [error, setError] = useState("")

    useEffect(() => {
        let isMounted = true
        const completeSignIn = async () => {
            if (!supabase) {
                setError("Sign-in is unavailable because Supabase is not configured.")
                return
            }

            const callbackUrl = new URL(window.location.href)
            const providerError = callbackUrl.searchParams.get("error_description")
                ?? callbackUrl.searchParams.get("error")
            if (providerError) {
                window.history.replaceState({}, document.title, callbackUrl.pathname)
                setError(providerError)
                return
            }

            const { data, error: sessionError } = await supabase.auth.getSession()
            if (!isMounted) return

            if (sessionError) {
                setError(sessionError.message)
                return
            }
            if (!data.session) {
                setError("Google sign-in did not return a session. Please try again.")
                return
            }

            window.history.replaceState({}, document.title, callbackUrl.pathname)
            navigate(getSafeReturnPath(), { replace: true })
        }

        void completeSignIn().catch(callbackError => {
            if (isMounted) {
                setError(callbackError instanceof Error ? callbackError.message : "Unable to complete sign-in.")
            }
        })

        return () => {
            isMounted = false
        }
    }, [navigate])

    return (
        <section className="grid min-h-dvh w-full place-items-center overflow-y-auto bg-[#fdfcfb] px-5 py-10 text-neutral-800 dark:bg-[#121110] dark:text-neutral-100">
            <div className="max-w-md text-center">
                {error
                    ? (
                        <>
                            <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-100">Sign-in couldn’t be completed</h1>
                            <p role="alert" className="mt-3 break-words text-sm leading-6 text-neutral-500 dark:text-neutral-400">{error}</p>
                            <Link
                                to="/"
                                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#1a1917] dark:text-neutral-200 dark:hover:bg-white/[0.05]"
                            >
                                <RotateCw size={16} aria-hidden="true" /> Return to Lucea
                            </Link>
                        </>
                    )
                    : (
                        <>
                            <LoaderCircle size={25} className="mx-auto animate-spin text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                            <h1 className="mt-4 text-xl font-medium text-neutral-900 dark:text-neutral-100">Finishing sign-in</h1>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">You’ll be redirected in a moment.</p>
                        </>
                    )
                }
            </div>
        </section>
    )
}

export default AuthCallback
