import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getSearchRecommendations } from "@/api/gemini"

interface SearchRecommendationsProps {
    urlQuery: string
    onSelect: (query: string) => void
}

const SearchRecommendations = ({ urlQuery, onSelect }: SearchRecommendationsProps) => {
    const { data: suggestions, isError } = useQuery({
        queryKey: ["recommendations", urlQuery.trim().toLowerCase()],
        queryFn: ({ signal }) => getSearchRecommendations(urlQuery, signal),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })

    const normalizedQuery = urlQuery.trim().toLowerCase()
    const fallbackSuggestions = ["photography", "inspiration", "aesthetic"]
        .map(term => `${urlQuery.trim()} ${term}`)
    const relatedSuggestions = (suggestions?.length ? suggestions : fallbackSuggestions)
        .map(suggestion => suggestion.trim())
        .filter((suggestion, index, list) =>
            suggestion.length > 0
            && suggestion.toLowerCase() !== normalizedQuery
            && list.findIndex(item => item.toLowerCase() === suggestion.toLowerCase()) === index,
        )

    if (!relatedSuggestions.length) return null

    return (
        <section aria-label="Search recommendations" className="mt-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold text-neutral-800">Search recommendations</h2>
                {isError && (
                    <span role="status" className="text-[11px] text-neutral-500">
                        Showing quick ideas
                    </span>
                )}
            </div>
            <ul aria-label="Related search suggestions" className="flex min-w-0 gap-2 overflow-x-auto scrollbar-hide">
                {relatedSuggestions.map(suggestion => (
                    <li key={suggestion}>
                        <Link
                            to={`/search?query=${encodeURIComponent(suggestion)}&type=photos`}
                            onMouseDown={event => event.preventDefault()}
                            onClick={event => {
                                event.preventDefault()
                                onSelect(suggestion)
                            }}
                            className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-black/[0.08] bg-white px-3 text-xs font-medium text-neutral-700 transition hover:border-black/[0.16] hover:bg-[#f8f6f2] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                        >
                            {suggestion}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default SearchRecommendations