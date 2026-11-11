import { lazy, Suspense, useState } from "react"
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom"
import Media from "./Media"
import Suggestions from "./Suggestions"
import { Topic } from "./Topic"
import { useTopic } from "@/store/useTopic"
import SearchBar from "@/components/features/SearchBar"
import ThemeToggle from "@/components/features/ThemeToggle"
import AccountButton from "@/components/layout/AccountButton"
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
        <div className="relative min-h-screen bg-[#fdfcfb] px-[18px] pb-[24px] pt-[140px] text-neutral-850 dark:bg-[#121110] dark:text-neutral-100">
            <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb]/95 backdrop-blur-md px-4 pt-4 md:left-[80px] md:px-5 md:pt-5 dark:border-white/10 dark:bg-[#121110]/95">
                <div className="flex items-center gap-2.5">
                    <div className="flex-1 min-w-0">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearchMedia} showRelatedSearches />
                    </div>
                    <ThemeToggle />
                    <AccountButton />
                </div>
                <Suggestions />
            </div>

            {!location.pathname.includes('/t')
                ? (
                    <>
                        <Suspense fallback={<div aria-hidden="true" className="mt-2 mb-4 min-h-[600px] animate-pulse rounded-[26px] bg-neutral-100 sm:mt-3 sm:mb-5 sm:min-h-[350px] md:min-h-[390px] md:rounded-[32px] dark:bg-neutral-800" />}>
                            <Featured />
                        </Suspense>
                        <div className="flex flex-col items-start justify-between gap-3 pt-2 pb-3 sm:flex-row sm:items-center">
                            <h1
                                className="font-editorial text-3xl sm:text-4xl font-normal text-neutral-900 dark:text-white tracking-[-0.01em] animate-subtle-reveal"
                            >
                                Photos & Videos
                            </h1>
                            <div
                                role="group"
                                aria-label="Filter feed by media type"
                                className="inline-flex max-w-full items-center gap-1 rounded-full border border-black/[0.08] bg-white/80 p-1 dark:border-white/[0.08] dark:bg-[#1a1917]/80"
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
                                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:focus-visible:outline-neutral-300 sm:px-4 sm:text-sm ${
                                            mediaFilter === value
                                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                                : "text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
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
