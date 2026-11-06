import { Link } from "react-router-dom"
import type { PublicMoodboardSummary } from "@/types/types"

const PublicMoodboardCard = ({ moodboard }: { moodboard: PublicMoodboardSummary }) => {
    const preview = moodboard.preview

    return (
        <article className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
            <Link
                to={`/profiles/${encodeURIComponent(moodboard.handle)}/boards/${encodeURIComponent(moodboard.id)}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
            >
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-neutral-100 to-[#f4efe9]">
                    {preview ? (
                        <img
                            src={preview.thumbnail}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <span className="grid h-full place-items-center text-sm text-neutral-500">An empty moodboard</span>
                    )}
                </div>
                <div className="p-3.5">
                    <h3 className="truncate text-sm font-medium text-neutral-800">{moodboard.title}</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                        {moodboard.mediaCount} {moodboard.mediaCount === 1 ? "item" : "items"}
                    </p>
                </div>
            </Link>
            <div className="border-t border-black/[0.06] px-3.5 py-2.5 text-xs text-neutral-500">
                by{" "}
                <Link
                    to={`/profiles/${encodeURIComponent(moodboard.handle)}`}
                    className="font-medium text-neutral-700 hover:text-neutral-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                >
                    {moodboard.handle}
                </Link>
            </div>
        </article>
    )
}

export default PublicMoodboardCard
