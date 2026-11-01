interface QueryFeedbackProps {
    error?: unknown
    empty?: boolean
    onRetry?: () => void
}

const QueryFeedback = ({ error, empty = false, onRetry }: QueryFeedbackProps) => {
    const hasError = Boolean(error)
    if (!hasError && !empty) return null
    const isRateLimited = typeof error === "object"
        && error !== null
        && "response" in error
        && typeof error.response === "object"
        && error.response !== null
        && "status" in error.response
        && error.response.status === 429

    return (
        <div
            role={hasError ? "alert" : "status"}
            className="my-6 flex flex-col items-center gap-2 text-center text-neutral-600"
        >
            <p>
                {hasError
                    ? isRateLimited
                        ? "We're experiencing a temporary slowdown. Please try again in a moment."
                        : "We couldn't load this media. Please try again."
                    : "No media found."}
            </p>
            {hasError && onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="cursor-pointer underline underline-offset-2 hover:text-neutral-900"
                >
                    Try again
                </button>
            )}
        </div>
    )
}

export default QueryFeedback
