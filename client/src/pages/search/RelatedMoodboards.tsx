import { useQuery } from "@tanstack/react-query"
import { searchPublicMoodboards } from "@/api/moodboards"
import PublicMoodboardCard from "@/components/features/PublicMoodboardCard"

const RelatedMoodboards = ({ query }: { query: string }) => {
    const { data: moodboards, isPending, isError } = useQuery({
        queryKey: ["public-moodboards", query],
        queryFn: ({ signal }) => searchPublicMoodboards(query, signal),
        enabled: query.length >= 2,
        staleTime: 60_000,
        retry: 1,
    })

    if (query.length < 2) return null

    if (isPending) {
        return (
            <section aria-label="Related public moodboards" className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-neutral-700">Related moodboards</h2>
                <p role="status" className="text-xs text-neutral-500">Looking for public moodboards…</p>
            </section>
        )
    }

    if (isError) {
        return (
            <p role="status" className="mb-6 text-xs text-neutral-500">
                Public moodboards are temporarily unavailable.
            </p>
        )
    }

    if (!moodboards?.length) return null

    return (
        <section aria-label="Related public moodboards" className="mb-6">
            <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-semibold text-neutral-700">Related moodboards</h2>
                <p className="text-xs text-neutral-500">Shared by the community</p>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {moodboards.map(moodboard => (
                    <PublicMoodboardCard key={`${moodboard.userId}-${moodboard.id}`} moodboard={moodboard} />
                ))}
            </div>
        </section>
    )
}

export default RelatedMoodboards
