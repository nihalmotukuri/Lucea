import { Link } from "react-router-dom"
import { useTopic } from "@/store/useTopic"
import HorizontalScroller from "@/components/features/HorizontalScroller"
import useDailyTopics from "@/hooks/useDailyTopics"
import { Sparkles } from "lucide-react"

const Suggestions = () => {
    const { isError, topicsReady } = useDailyTopics()
    const topics = useTopic(state => state.topics)
    const activeTopic = useTopic(state => state.activeTopic)
    const setActiveTopic = useTopic(state => state.setActiveTopic)

    return (
        <div className="flex h-[46px] min-w-0 items-center gap-4">
            <span className="inline-flex h-full shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-medium leading-none text-neutral-500">
                <Sparkles
                    size={14}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="text-amber-500 [fill:#fcd34d] [stroke:#f97316] drop-shadow-[0_1px_2px_rgba(249,115,22,0.22)]"
                />
                <span>Today’s sparks</span>
            </span>
            <div className="min-w-0 flex-1">
                {topicsReady ? (
                    <HorizontalScroller label="today's visual topics">
                        <ul aria-label="Today’s visual topics" className="flex h-[46px] w-full items-center gap-5 whitespace-nowrap pr-8">
                            {topics.map((topic, index) => (
                                <li key={topic.slug} className="relative shrink-0">
                                    <Link
                                        onClick={() => setActiveTopic(topic.slug)}
                                        to={`/t/${topic.slug}`}
                                        aria-current={activeTopic === topic.slug ? "page" : undefined}
                                        className={`relative inline-flex items-center py-1 text-[13px] leading-none transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-neutral-900 after:content-[''] motion-safe:after:transition-transform motion-safe:after:duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:text-sm ${
                                            activeTopic === topic.slug
                                                ? "text-neutral-900 after:scale-x-100"
                                                : "text-neutral-500 after:scale-x-0 hover:text-neutral-900 hover:after:scale-x-100 focus-visible:after:scale-x-100"
                                        }`}
                                    >
                                        {topic.title}
                                    </Link>
                                    {index < topics.length - 1 && (
                                        <span aria-hidden="true" className="pointer-events-none absolute -right-3 top-1/2 size-0.5 -translate-y-1/2 rounded-full bg-neutral-300" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </HorizontalScroller>
                ) : (
                    <div role="status" aria-label="Loading daily topics" className="flex h-[46px] items-center gap-2">
                        <span className="size-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
                        <span className="text-xs text-neutral-400">Finding today’s sparks…</span>
                    </div>
                )}
            </div>
            {isError && (
                <span className="sr-only" role="status">
                    Daily topics are temporarily unavailable. Showing the saved topic set.
                </span>
            )}
        </div>
    )
}

export default Suggestions