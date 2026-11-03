import { useState } from "react"
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom"
import Media from "./Media"
import Suggestions from "./Suggestions"
import { Topic } from "./Topic"
import { useTopic } from "@/store/useTopic"
import Featured from "./Featured"
import SearchBar from "@/components/features/SearchBar"

const Home = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const { topicSlug } = useParams()
    const setActiveTopic = useTopic(state => state.setActiveTopic)
    const topics = useTopic(state => state.topics)

    if (!topicSlug) { 
        setActiveTopic('') 
    } else { 
        setActiveTopic(topicSlug) 
    }

    if (topicSlug && !topics.some(t => t.slug === topicSlug)) return <Navigate to='/' replace />

    const onSearchMedia = (searchTerm: string) => {
        const query = searchTerm.trim()
        if (!query) return
        navigate(`/search?query=${encodeURIComponent(query)}&type=photos`)
    }

    return (
        <div className="relative bg-[#fdfcfb] px-[18px] pb-[24px] pt-[140px]">
            <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb] px-4 pt-4 md:left-[80px] md:px-5 md:pt-5">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearchMedia} />
                <Suggestions />
            </div>

            {!location.pathname.includes('/t')
                ? (
                    <>
                        <Featured />
                        <h1
                            className="pt-2 pb-3 text-3xl text-neutral-700"
                            style={{ fontFamily: '"PT Serif", serif' }}
                        >
                            Photos & Videos
                        </h1>
                        <Media />
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
