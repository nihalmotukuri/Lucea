import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Sparkles, TrendingUp } from "lucide-react"
import { getSearchRecommendations } from "@/api/gemini"
import SearchDropdownLoading from "@/components/features/SearchDropdownLoading"

interface SearchRecommendationsProps {
    urlQuery: string
    onSelect: (query: string) => void
}

const SearchRecommendations = ({ urlQuery, onSelect }: SearchRecommendationsProps) => {
    const { data: suggestions, isError, isPending } = useQuery({
        queryKey: ["recommendations", urlQuery.trim().toLowerCase()],
        queryFn: ({ signal }) => getSearchRecommendations(urlQuery, signal),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })

    const normalizedQuery = urlQuery.trim().toLowerCase()
    const trimmed = urlQuery.trim()
    const fallbackSuggestions = [
        `${trimmed} aesthetic`,
        `${trimmed} editorial`,
        `${trimmed} cinematic`,
        `${trimmed} minimalist`,
        `${trimmed} vintage`,
        `${trimmed} ambient`,
    ]
    const relatedSuggestions = (isError ? fallbackSuggestions : suggestions ?? [])
        .map(suggestion => suggestion.trim())
        .filter((suggestion, index, list) =>
            suggestion.length > 0
            && suggestion.toLowerCase() !== normalizedQuery
            && list.findIndex(item => item.toLowerCase() === suggestion.toLowerCase()) === index,
        )

    if (isPending) {
        return (
            <section aria-label="Search recommendations" className="mt-2">
                <h2 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    <Sparkles size={13} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    Recommended ideas
                </h2>
                <SearchDropdownLoading label="Curating aesthetic ideas…" />
            </section>
        )
    }

    if (!relatedSuggestions.length) return null

    return (
        <section aria-label="Search recommendations" className="mt-2 animate-subtle-reveal">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    <Sparkles size={13} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    Recommended ideas
                </h2>
                {isError && (
                    <span role="status" className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Curated tags
                    </span>
                )}
            </div>
            <ul aria-label="Related search suggestions" className="flex min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {relatedSuggestions.map(suggestion => (
                    <li key={suggestion}>
                        <Link
                            to={`/search?query=${encodeURIComponent(suggestion)}&type=photos`}
                            onMouseDown={event => event.preventDefault()}
                            onClick={event => {
                                event.preventDefault()
                                onSelect(suggestion)
                            }}
                            className="group inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 text-xs font-medium text-neutral-700 shadow-2xs transition hover:border-black/[0.16] hover:bg-[#f8f6f2] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-white/10 dark:bg-[#24211e] dark:text-neutral-200 dark:hover:border-white/20 dark:hover:bg-[#2c2824] dark:hover:text-white"
                        >
                            <TrendingUp size={12} className="shrink-0 text-neutral-400 transition-colors group-hover:text-amber-600 dark:text-neutral-500 dark:group-hover:text-amber-400" aria-hidden="true" />
                            <span>{suggestion}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default SearchRecommendations