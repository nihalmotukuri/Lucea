import { AlertCircle, ImageOff, LoaderCircle, RotateCw, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

interface QueryFeedbackProps {
    error?: unknown
    empty?: boolean
    onRetry?: () => void
    isRetrying?: boolean
}

const suggestedSearches = [
    "Minimalist architecture",
    "Film photography",
    "Cinematic drone",
    "Moody landscapes",
    "Warm interiors",
]

const QueryFeedback = ({ error, empty = false, onRetry, isRetrying = false }: QueryFeedbackProps) => {
    const hasError = Boolean(error)
    if (!hasError && !empty) return null
    const isRateLimited = typeof error === "object"
        && error !== null
        && "response" in error
        && typeof error.response === "object"
        && error.response !== null
        && "status" in error.response
        && error.response.status === 429

    const message = hasError
        ? isRateLimited
            ? "We're taking a short breather. Give it a moment, then try again."
            : "We couldn't bring these visuals in. Please try again."
        : "No visuals found for this search."

    if (hasError && isRetrying) {
        return (
            <div
                role="status"
                className="mx-auto my-6 flex w-full max-w-xl items-center justify-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-4 text-sm text-neutral-500 dark:border-white/[0.08] dark:bg-[#1a1917]/70 dark:text-neutral-400"
            >
                <LoaderCircle size={16} className="animate-spin text-neutral-600 dark:text-neutral-300" aria-hidden="true" />
                <span>Taking another look…</span>
            </div>
        )
    }

    return (
        <div
            role={hasError ? "alert" : "status"}
            className="mx-auto my-8 flex w-full max-w-xl flex-col items-center rounded-3xl border border-black/[0.07] bg-white/80 px-5 py-8 text-center shadow-[0_8px_32px_rgba(35,29,22,0.035)] sm:px-8 sm:py-10 dark:border-white/[0.08] dark:bg-[#1a1917]/90"
        >
            <span className={`grid size-12 place-items-center rounded-2xl ${hasError ? "bg-[#f5eee7] text-neutral-700 dark:bg-[#28221c] dark:text-neutral-200" : "bg-neutral-100 text-neutral-500 dark:bg-[#25221e] dark:text-neutral-400"}`}>
                {hasError
                    ? <AlertCircle size={21} strokeWidth={1.7} aria-hidden="true" />
                    : <ImageOff size={21} strokeWidth={1.7} aria-hidden="true" />
                }
            </span>
            <h2 className="mt-4 text-base font-semibold text-neutral-800 dark:text-neutral-100">
                {hasError ? "We hit a small snag" : "A quiet corner"}
            </h2>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">{message}</p>
            {empty && (
                <div className="mt-6 flex flex-col items-center">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                        <Sparkles size={13} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        Explore trending ideas instead
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {suggestedSearches.map(tag => (
                            <Link
                                key={tag}
                                to={`/search?query=${encodeURIComponent(tag)}&type=photos`}
                                className="inline-flex min-h-8 items-center rounded-full border border-black/[0.08] bg-white px-3 text-xs font-medium text-neutral-700 shadow-xs transition hover:border-black/20 hover:bg-[#f6f2ec] hover:text-neutral-900 active:scale-95 dark:border-white/10 dark:bg-[#25221e] dark:text-neutral-200 dark:hover:bg-[#2e2a25] dark:hover:text-white"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            {hasError && onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-px hover:bg-neutral-700 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                    <RotateCw size={15} aria-hidden="true" />
                    Try again
                </button>
            )}
        </div>
    )
}

export default QueryFeedback
