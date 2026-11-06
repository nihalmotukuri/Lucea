import { Link } from "react-router-dom"
import { ArrowUpRight, ImagePlus } from "lucide-react"
import type { PublicMoodboardSummary } from "@/types/types"

const PublicMoodboardCard = ({ moodboard }: { moodboard: PublicMoodboardSummary }) => {
    const preview = moodboard.preview.slice(0, 3)

    return (
        <article className="group relative overflow-hidden rounded-[28px] bg-neutral-200 transition-shadow duration-300 hover:shadow-lg">
            <Link
                to={`/profiles/${encodeURIComponent(moodboard.handle)}/boards/${encodeURIComponent(moodboard.id)}`}
                aria-label={`${moodboard.title}, ${moodboard.mediaCount} saved ${moodboard.mediaCount === 1 ? "item" : "items"}`}
                className="relative block aspect-[4/3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
            >
                <div className={`absolute inset-0 overflow-hidden ${preview.length > 1 ? "grid grid-cols-3 grid-rows-2 gap-1 bg-[#fdfcfb]" : "bg-gradient-to-br from-neutral-100 to-[#f4efe9]"}`}>
                    {preview.length === 0 ? (
                        <span className="grid h-full place-items-center text-neutral-500">
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
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
                    <span className="min-w-0">
                        <span className="block truncate text-2xl font-normal uppercase tracking-tight text-white">{moodboard.title}</span>
                        <span className="mt-1 block text-sm text-white/85">
                            {moodboard.mediaCount} {moodboard.mediaCount === 1 ? "item" : "items"}
                        </span>
                    </span>
                    <ArrowUpRight size={19} className="mb-1 shrink-0 text-white/85" aria-hidden="true" />
                </span>
            </Link>
            <Link
                to={`/profiles/${encodeURIComponent(moodboard.handle)}`}
                className="absolute right-4 top-4 rounded-full border border-white/35 bg-black/25 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5 sm:top-5"
            >
                by {moodboard.handle}
            </Link>
        </article>
    )
}

export default PublicMoodboardCard
