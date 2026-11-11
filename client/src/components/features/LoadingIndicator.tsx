interface LoadingIndicatorProps {
    label: string
    className?: string
}

const LoadingIndicator = ({ label, className = "min-h-[65vh] w-full" }: LoadingIndicatorProps) => (
    <div
        role="status"
        aria-label={label}
        className={`flex flex-col items-center justify-center gap-3 bg-transparent text-neutral-800 dark:text-neutral-200 ${className}`}
    >
        <svg
            aria-hidden="true"
            viewBox="0 0 64 64"
            className="size-12 motion-safe:animate-spin"
            fill="none"
        >
            <g fill="currentColor">
                <rect x="11" y="13" width="8" height="4" rx="2" transform="rotate(-45 15 15)" />
                <rect x="18.8" y="7.8" width="8" height="4" rx="2" transform="rotate(-22.5 22.8 9.8)" />
                <rect x="28" y="6" width="8" height="4" rx="2" />
                <rect x="37.2" y="7.8" width="8" height="4" rx="2" transform="rotate(22.5 41.2 9.8)" />
                <rect x="45" y="13" width="8" height="4" rx="2" transform="rotate(45 49 15)" />
            </g>
        </svg>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
    </div>
)

export default LoadingIndicator
