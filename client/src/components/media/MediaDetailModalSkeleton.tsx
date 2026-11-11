import { ArrowLeft, X } from "lucide-react"

interface MediaDetailModalSkeletonProps {
    onBack: () => void
    onClose: () => void
    mediaType?: "photo" | "video"
}

export const MediaDetailModalSkeleton = ({
    onBack,
    onClose,
    mediaType = "photo",
}: MediaDetailModalSkeletonProps) => {
    return (
        <article
            aria-busy="true"
            aria-label={`Loading ${mediaType} details`}
            className="w-full max-w-[1200px] overflow-y-auto rounded-[26px] bg-[#fdfcfb] text-neutral-800 shadow-[0_32px_100px_rgba(0,0,0,0.5)] sm:max-h-[94dvh] sm:rounded-[34px] dark:border dark:border-white/[0.08] dark:bg-[#161413] dark:text-neutral-100"
        >
            <div className="px-4 pb-8 pt-4 sm:px-7 sm:pb-10 sm:pt-6 lg:px-10 lg:pb-12">
                {/* Header bar matching MediaDetailView */}
                <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-5 flex items-center justify-between border-b border-black/[0.06] bg-[#fdfcfb]/95 px-4 py-3 backdrop-blur-md sm:-mx-7 sm:-mt-6 sm:px-7 lg:-mx-10 lg:-mt-6 lg:px-10 dark:border-white/[0.08] dark:bg-[#161413]/95">
                    <button
                        type="button"
                        autoFocus
                        onClick={onBack}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-neutral-600 transition hover:bg-black/[0.045] hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800 dark:text-neutral-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    >
                        <ArrowLeft size={17} aria-hidden="true" />
                        Back to your trail
                    </button>
                    <button
                        type="button"
                        aria-label="Close media details"
                        onClick={onClose}
                        className="grid size-10 place-items-center rounded-full text-neutral-500 transition hover:bg-black/[0.05] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    >
                        <X size={18} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                </div>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)] lg:gap-6">
                    {/* Media frame skeleton matching the image/video container */}
                    <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-[18px] bg-[#eae6e0] dark:bg-[#201d1a]">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/[0.06]" />
                    </div>

                    {/* Right column sidebar skeleton */}
                    <aside className="flex flex-col gap-5">
                        {/* Creator header */}
                        <div className="space-y-2">
                            <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-6 w-44 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                        </div>

                        {/* Button row */}
                        <div className="flex flex-wrap gap-2 border-y border-black/[0.08] py-4 dark:border-white/[0.08]">
                            <div className="h-10 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-10 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-10 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        </div>

                        {/* Metadata dl */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <div className="h-2.5 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                                <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-2.5 w-14 rounded bg-neutral-200 dark:bg-neutral-800" />
                                <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 border-t border-black/[0.08] pt-4 dark:border-white/[0.08]">
                            <div className="h-2.5 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-5 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    )
}

export default MediaDetailModalSkeleton

