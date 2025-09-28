import { Link } from "react-router-dom"
import { useTopic } from "@/store/useTopic"

const Suggestions = () => {
    const topics = useTopic(state => state.topics)
    const activeTopic = useTopic(state => state.activeTopic)
    const setActiveTopic = useTopic(state => state.setActiveTopic)

    return (
        <ul className="w-full flex gap-6">
            {topics.map((topic, idx) => (
                <Link
                    key={idx}
                    onClick={() => setActiveTopic(topic.slug)}
                    to={`/t/${topic.slug}`}
                    className={`${activeTopic === topic.slug ? 'text-neutral-900 border-neutral-900' : 'text-neutral-500 border-transparent'} border-b-2 pt-4 pb-3 text-sm cursor-pointer hover:text-neutral-900`}
                >
                    {topic.title}
                </Link>
            ))}
        </ul>
    )
}

export default Suggestions