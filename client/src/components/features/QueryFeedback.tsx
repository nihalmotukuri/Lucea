import { AlertCircle, ImageOff, LoaderCircle, RotateCw } from "lucide-react"

interface QueryFeedbackProps {
    error?: unknown
    empty?: boolean
    onRetry?: () => void
    isRetrying?: boolean
}

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
                className="mx-auto my-6 flex w-full max-w-xl items-center justify-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-4 text-sm text-neutral-500"
            >
                <LoaderCircle size={16} className="animate-spin text-neutral-600" aria-hidden="true" />
                <span>Taking another look…</span>
            </div>
        )
    }

    return (
        <div
            role={hasError ? "alert" : "status"}
            className="mx-auto my-8 flex w-full max-w-xl flex-col items-center rounded-3xl border border-black/[0.07] bg-white/80 px-5 py-8 text-center shadow-[0_8px_32px_rgba(35,29,22,0.035)] sm:px-8 sm:py-10"
        >
            <span className={`grid size-12 place-items-center rounded-2xl ${hasError ? "bg-[#f5eee7] text-neutral-700" : "bg-neutral-100 text-neutral-500"}`}>
                {hasError
                    ? <AlertCircle size={21} strokeWidth={1.7} aria-hidden="true" />
                    : <ImageOff size={21} strokeWidth={1.7} aria-hidden="true" />
                }
            </span>
            <h2 className="mt-4 text-base font-semibold text-neutral-800">
                {hasError ? "We hit a small snag" : "A quiet corner"}
            </h2>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-neutral-500">{message}</p>
            {hasError && onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-px hover:bg-neutral-700 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                >
                    <RotateCw size={15} aria-hidden="true" />
                    Try again
                </button>
            )}
        </div>
    )
}

export default QueryFeedback
