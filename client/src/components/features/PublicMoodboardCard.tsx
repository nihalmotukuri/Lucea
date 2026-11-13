import { Link } from "react-router-dom"
import { ArrowUpRight, ImagePlus } from "lucide-react"
import type { PublicMoodboardSummary } from "@/types/types"

const PublicMoodboardCard = ({
    moodboard,
    showCreator = true,
}: {
    moodboard: PublicMoodboardSummary
    showCreator?: boolean
}) => {
    const preview = moodboard.preview.slice(0, 3)

    return (
        <article className="group relative overflow-hidden rounded-[24px] bg-neutral-200 transition-shadow duration-300 hover:shadow-lg dark:bg-neutral-800 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)]">
            <Link
                to={`/profiles/${encodeURIComponent(moodboard.handle)}/boards/${encodeURIComponent(moodboard.id)}`}
                aria-label={`${moodboard.title}, ${moodboard.mediaCount} saved ${moodboard.mediaCount === 1 ? "item" : "items"}`}
                className="relative block aspect-[4/3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
            >
                <div className={`absolute inset-0 overflow-hidden ${preview.length > 1 ? "grid grid-cols-3 grid-rows-2 gap-1 bg-[#fdfcfb] dark:bg-[#121110]" : "bg-gradient-to-br from-neutral-100 to-[#f4efe9] dark:from-neutral-900 dark:to-[#1a1917]"}`}>
                    {preview.length === 0 ? (
                        <span className="grid h-full place-items-center text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-2 text-sm"><ImagePlus size={17} aria-hidden="true" /> No saved items yet</span>
                        </span>
                    ) : (
                        preview.map((item, index) => (
                            <div
                                key={item.key}
                                className={`relative min-h-0 min-w-0 overflow-hidden ${
                                    preview.length === 1
                                        ? "h-full w-full"
                                        : index === 0
                                            ? "col-span-2 row-span-2"
                                            : preview.length === 2
                                                ? "col-span-1 row-span-2"
                                                : "col-span-1 row-span-1"
                                }`}
                            >
                                <img
                                    src={item.thumbnail}
                                    alt=""
                                    loading="lazy"
                                    className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
                                />
                                {index === preview.length - 1 && moodboard.mediaCount > preview.length && (
                                    <span className="absolute inset-0 grid place-items-center bg-black/40 text-lg font-medium text-white">
                                        +{moodboard.mediaCount - preview.length}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
                    <span className="min-w-0">
                        <span className="block truncate font-editorial text-xl font-normal text-white sm:text-2xl">{moodboard.title}</span>
                        <span className="mt-0.5 block text-xs text-white/85">
                            {moodboard.mediaCount} {moodboard.mediaCount === 1 ? "item" : "items"}
                        </span>
                    </span>
                    <ArrowUpRight size={19} className="mb-1 shrink-0 text-white/85 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </span>
            </Link>
            {showCreator && (
                <div className="border-t border-black/[0.06] bg-[#fdfcfb] px-4 py-2.5 text-xs text-neutral-500 dark:border-white/[0.06] dark:bg-[#1a1917] dark:text-neutral-400 sm:px-5">
                    by{" "}
                    <Link
                        to={`/profiles/${encodeURIComponent(moodboard.handle)}`}
                        className="font-medium text-neutral-700 transition hover:text-neutral-950 hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-200 dark:hover:text-white"
                    >
                        {moodboard.handle}
                    </Link>
                </div>
            )}
        </article>
    )
}

export default PublicMoodboardCard
