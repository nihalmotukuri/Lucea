import { lazy, Suspense, useState } from "react"
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom"
import Media from "./Media"
import Suggestions from "./Suggestions"
import { Topic } from "./Topic"
import { useTopic } from "@/store/useTopic"
import SearchBar from "@/components/features/SearchBar"
import { Images, LayoutGrid, Video } from "lucide-react"
import useDailyTopics from "@/hooks/useDailyTopics"

const Featured = lazy(() => import("./Featured"))

type MediaFilter = "all" | "photos" | "videos"

const Home = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all")
    const { topicSlug } = useParams()
    const topics = useTopic(state => state.topics)
    const { topicsReady } = useDailyTopics()

    if (topicSlug && !topics.some(t => t.slug === topicSlug)) {
        if (!topicsReady) return <p role="status" className="pt-40 text-center text-sm text-neutral-500">Finding today’s topics…</p>
        return <Navigate to='/' replace />
    }

    const onSearchMedia = (searchTerm: string) => {
        const query = searchTerm.trim()
        if (!query) return
        navigate(`/search?query=${encodeURIComponent(query)}&type=photos`)
    }

    return (
        <div className="relative bg-[#fdfcfb] px-[18px] pb-[24px] pt-[140px]">
            <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb] px-4 pt-4 md:left-[80px] md:px-5 md:pt-5">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearchMedia} showRelatedSearches />
                <Suggestions />
            </div>

            {!location.pathname.includes('/t')
                ? (
                    <>
                        <Suspense fallback={<div aria-hidden="true" className="mt-2 mb-4 min-h-[600px] animate-pulse rounded-[26px] bg-neutral-100 sm:mt-3 sm:mb-5 sm:min-h-[350px] md:min-h-[390px] md:rounded-[32px]" />}>
                            <Featured />
                        </Suspense>
                        <div className="flex flex-col items-start justify-between gap-3 pt-2 pb-3 sm:flex-row sm:items-center">
                            <h1
                                className="text-3xl text-neutral-700"
                                style={{ fontFamily: '"PT Serif", serif' }}
                            >
                                Photos & Videos
                            </h1>
                            <div
                                role="group"
                                aria-label="Filter feed by media type"
                                className="inline-flex max-w-full items-center gap-1 rounded-full border border-black/[0.08] bg-white/80 p-1"
                            >
                                {([
                                    { value: "all", label: "Everything", Icon: LayoutGrid },
                                    { value: "photos", label: "Photos", Icon: Images },
                                    { value: "videos", label: "Videos", Icon: Video },
                                ] as const).map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={mediaFilter === value}
                                        onClick={() => setMediaFilter(value)}
                                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:px-4 sm:text-sm ${
                                            mediaFilter === value
                                                ? "bg-neutral-900 text-white"
                                                : "text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900"
                                        }`}
                                    >
                                        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Media filter={mediaFilter} />
                    </>
                )
                : (
                    <Topic topicSlug={topicSlug} />
                )
            }
        </div>
    )
}

export default Home
