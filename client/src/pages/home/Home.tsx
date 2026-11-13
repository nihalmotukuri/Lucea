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

const FEED_FILTER_PREF_KEY = "lucea.defaultFeedFilter"

const getInitialFeedFilter = (): MediaFilter => {
    try {
        const stored = localStorage.getItem(FEED_FILTER_PREF_KEY)
        if (stored === "photos" || stored === "videos" || stored === "all") {
            return stored
        }
        return "all"
    } catch {
        return "all"
    }
}

const Home = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const [mediaFilter, setMediaFilter] = useState<MediaFilter>(getInitialFeedFilter)
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
        <div className="relative min-h-screen bg-[#fdfcfb] px-[18px] pb-[24px] pt-[148px] text-neutral-850 dark:bg-[#121110] dark:text-neutral-100">
            <div className="fixed top-0 right-0 left-0 z-30 m-auto border-b border-black/10 bg-[#fdfcfb]/95 backdrop-blur-md px-4 pt-4 pb-1.2 md:left-[80px] md:px-5 md:pt-5 dark:border-white/10 dark:bg-[#121110]/95">
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
                        <Suspense fallback={
                            <section aria-hidden="true" className="mt-2 mb-9 sm:mt-3">
                                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                                    <div className="flex items-center gap-3">
                                        <span className="h-2 w-32 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                        <div className="hidden items-center gap-1.5 sm:flex">
                                            {Array.from({ length: 7 }, (_, index) => (
                                                <span
                                                    key={index}
                                                    className={`h-1.5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800 ${index === 0 ? "w-5" : "w-1.5"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                        <span className="size-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                        <span className="size-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                        <span className="size-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
                                    <div className="min-h-[300px] w-full animate-pulse rounded-[16px] bg-neutral-100 sm:min-h-[350px] sm:rounded-[20px] md:min-h-[390px] md:w-[55%] md:rounded-[24px] dark:bg-neutral-800" />
                                    <div className="flex flex-1 gap-2 overflow-hidden pb-1 sm:grid sm:min-h-[350px] sm:grid-cols-3 sm:grid-rows-2 md:min-h-[390px]">
                                        {Array.from({ length: 6 }, (_, index) => (
                                            <div
                                                key={index}
                                                className="min-h-[92px] w-[140px] shrink-0 animate-pulse rounded-[10px] bg-neutral-100 sm:min-h-[112px] sm:w-auto sm:rounded-[14px] md:rounded-[16px] dark:bg-neutral-800"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </section>
                        }>
                            <Featured />
                        </Suspense>
                        <div className="flex flex-col items-start justify-between gap-3 pb-3 sm:flex-row sm:items-start">
                            <h1
                                className="font-editorial text-3xl sm:text-4xl font-normal text-neutral-900 dark:text-white tracking-[-0.01em]"
                            >
                                Still & Moving
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
