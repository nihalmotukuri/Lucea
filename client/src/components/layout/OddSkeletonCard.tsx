const OddSkeletonCard = () => (
    <div
        className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#eae6e0] dark:bg-[#201d1a] aspect-[3/4]"
    >
        <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/[0.06] to-transparent [animation-delay:350ms]"
        />
    </div>
)

export default OddSkeletonCard