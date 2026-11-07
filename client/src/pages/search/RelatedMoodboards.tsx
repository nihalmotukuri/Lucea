import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { searchPublicMoodboards } from "@/api/moodboards"
import SearchDropdownLoading from "@/components/features/SearchDropdownLoading"

interface RelatedMoodboardsProps {
    query: string
}

const ignoredQueryTerms = new Set([
    "and", "for", "the", "with", "from", "into", "your", "you",
    "in", "on", "at", "to", "of", "by", "or", "a", "an",
])

const normalizeText = (value: string) => value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const isRelevantMoodboard = (query: string, title: string, previewText: string) => {
    const queryTerms = [...new Set(normalizeText(query).split(" ").filter(term =>
        term.length > 1 && !ignoredQueryTerms.has(term),
    ))]
    if (!queryTerms.length) return false

    const titleTerms = new Set(normalizeText(title).split(" "))
    const boardTerms = new Set([...titleTerms, ...normalizeText(previewText).split(" ")])
    const titleMatches = queryTerms.filter(term => titleTerms.has(term)).length
    const matchingTerms = queryTerms.filter(term => boardTerms.has(term)).length
    const minimumMatches = queryTerms.length === 1 ? 1 : Math.max(2, Math.ceil(queryTerms.length * 0.5))
    return titleMatches > 0 && matchingTerms >= minimumMatches
}

const RelatedMoodboards = ({ query }: RelatedMoodboardsProps) => {
    const normalizedQuery = query.trim().replace(/\s+/g, " ")
    const { data: results, isPending, isError } = useQuery({
        queryKey: ["public-moodboards", normalizedQuery.toLowerCase()],
        queryFn: ({ signal }) => searchPublicMoodboards(normalizedQuery, signal),
        enabled: normalizedQuery.length >= 2 && normalizedQuery.length <= 60,
        staleTime: 60_000,
        retry: 1,
    })

    const moodboards = (results ?? []).filter(board => isRelevantMoodboard(
        normalizedQuery,
        board.title,
        board.preview.map(item => item.alt).join(" "),
    )).slice(0, 5)

    if (normalizedQuery.length < 2 || (!isPending && !isError && !moodboards.length)) return null

    return (
        <section aria-label="Community moodboard recommendations">
            <h2 className="mb-1.5 text-xs font-semibold text-neutral-800">Moodboards</h2>
            {isError
                ? <p role="status" className="px-1 text-xs text-neutral-500">Unavailable</p>
                : isPending
                    ? <SearchDropdownLoading label="Finding matching boards…" />
                : (
                    <div className="min-w-0 overflow-x-auto scrollbar-hide">
                        <ul className="flex w-max items-center gap-2">
                            {moodboards.map(board => (
                                <li key={`${board.userId}-${board.id}`}>
                                    <Link
                                        to={`/profiles/${encodeURIComponent(board.handle)}/boards/${encodeURIComponent(board.id)}`}
                                        aria-label={`${board.title} by ${board.handle}`}
                                        onMouseDown={event => event.preventDefault()}
                                        className="flex h-12 w-56 items-center gap-2 overflow-hidden rounded-xl border border-black/[0.08] bg-white pr-2 text-left transition hover:border-black/20 hover:bg-[#f8f6f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                    >
                                        {board.preview[0] && (
                                            <img
                                                src={board.preview[0].thumbnail}
                                                alt=""
                                                loading="lazy"
                                                className="h-full w-14 shrink-0 object-cover"
                                            />
                                        )}
                                        <span className="min-w-0">
                                            <span className="block truncate text-xs font-medium text-neutral-800">{board.title}</span>
                                            <span className="block truncate text-[10px] text-neutral-500">by {board.handle}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }
        </section>
    )
}

export default RelatedMoodboards
