import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import HorizontalScroller from "@/components/features/HorizontalScroller"
import { LoaderCircle, RotateCw, Sparkles } from "lucide-react"
import { getSearchRecommendations } from "@/api/gemini"

interface SearchRecommendationsProps {
    urlQuery: string
}

const SearchRecommendations = ({ urlQuery }: SearchRecommendationsProps) => {
    const {
        data: suggestions,
        isPending,
        isError,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ['recommendations', urlQuery],
        queryFn: ({ signal }) => getSearchRecommendations(urlQuery, signal),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })

    if (isPending) {
        return (
            <div className="flex h-[46px] min-w-0 items-center gap-2.5" role="status" aria-label="Finding related search ideas">
                <span className="flex shrink-0 items-center gap-2 text-[11px] font-medium text-neutral-400">
                    <Sparkles size={13} aria-hidden="true" /> Related
                </span>
                <LoaderCircle size={13} className="animate-spin text-neutral-400" aria-hidden="true" />
                <span className="text-xs text-neutral-400">Finding ideas</span>
            </div>
        )
    }

    if (isError && !suggestions?.length) {
        return (
            <div role="status" className="flex h-[46px] min-w-0 items-center gap-2.5">
                <Sparkles size={13} className="shrink-0 text-neutral-400" aria-hidden="true" />
                <span className="shrink-0 text-[11px] font-medium text-neutral-400">Related</span>
                <span className="truncate text-xs text-neutral-400">Ideas unavailable</span>
                <button
                    type="button"
                    onClick={() => void refetch()}
                    disabled={isFetching}
                    className="inline-flex min-h-8 shrink-0 items-center gap-1.5 px-1 text-xs text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                >
                    {isFetching
                        ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
                        : <RotateCw size={13} aria-hidden="true" />
                    }
                    <span>{isFetching ? "Trying" : "Retry"}</span>
                </button>
            </div>
        )
    }

    return (
        <div className="flex h-[46px] min-w-0 items-center gap-2.5">
            <span className="flex shrink-0 items-center gap-2 text-[11px] font-medium text-neutral-400">
                <Sparkles size={13} aria-hidden="true" />
                <span>Related</span>
            </span>
            <HorizontalScroller label="related search suggestions">
                <ul aria-label="Related search suggestions" className="flex h-[46px] w-full items-center gap-5 whitespace-nowrap pr-8">
                    {suggestions?.map((suggestion, idx) => (
                        <li key={`${suggestion}-${idx}`} className="relative shrink-0">
                            <Link
                                to={`/search?query=${encodeURIComponent(suggestion)}&type=photos`}
                                className="text-xs text-neutral-500 transition hover:text-neutral-900 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:text-[13px]"
                            >
                                {suggestion}
                            </Link>
                            {idx < (suggestions?.length ?? 0) - 1 && (
                                <span aria-hidden="true" className="pointer-events-none absolute -right-3 top-1/2 size-0.5 -translate-y-1/2 rounded-full bg-neutral-300" />
                            )}
                        </li>
                    ))}
                </ul>
            </HorizontalScroller>
            {isFetching && (
                <span className="sr-only" role="status">Refreshing related ideas</span>
            )}
        </div>
    )
}

export default SearchRecommendations