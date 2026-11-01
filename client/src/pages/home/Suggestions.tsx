import { Link } from "react-router-dom"
import { useTopic } from "@/store/useTopic"
import HorizontalScroller from "@/components/features/HorizontalScroller"

const Suggestions = () => {
    const topics = useTopic(state => state.topics)
    const activeTopic = useTopic(state => state.activeTopic)
    const setActiveTopic = useTopic(state => state.setActiveTopic)

    return (
        <HorizontalScroller label="topics">
            <ul aria-label="Browse topics" className="flex w-full gap-6 whitespace-nowrap">
                {topics.map((topic) => (
                    <li key={topic.slug} className="shrink-0">
                        <Link
                            onClick={() => setActiveTopic(topic.slug)}
                            to={`/t/${topic.slug}`}
                            aria-current={activeTopic === topic.slug ? "page" : undefined}
                            className={`${activeTopic === topic.slug ? 'text-neutral-900 border-neutral-900' : 'text-neutral-500 border-transparent'} block border-b-2 pt-4 pb-3 text-sm hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700`}
                        >
                            {topic.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </HorizontalScroller>
    )
}

export default Suggestions