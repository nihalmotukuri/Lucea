import { useState } from "react"
import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom"
import { IoSearch } from "react-icons/io5"
import type React from "react"
import Media from "./Media"
// import FeaturedCollections from "../explore/FeaturedCollections"
import Suggestions from "./Suggestions"
import { Topic } from "./Topic"
import { useTopic } from "@/store/useTopic"
import Featured from "./Featured"
// import MediaDetailModal from "@/components/PhotoDetailModel"

const Home = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const { topicSlug } = useParams()
    const setActiveTopic = useTopic(state => state.setActiveTopic)
    const topics = useTopic(state => state.topics)

    if (!topicSlug) { setActiveTopic('') }
    else setActiveTopic(topicSlug)

    if (topicSlug && !topics.some(t => t.slug === topicSlug)) return <Navigate to='/' replace />

    const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!searchQuery) return null

        navigate(`/search?query=${searchQuery}&type=photos`)
    }

    return (
        <div className="relative bg-[#fdfcfb] px-[18px] pb-[24px] pt-[140px]">
            <div className="fixed top-0 right-0 left-[80px] bg-[#fdfcfb] z-10 m-auto px-5 pt-5 border-b border-black/10">
                <form
                    onSubmit={onSearchMedia}
                    className="relative h-[50px] w-full p-[16px] rounded-2xl flex items-center border border-black/10"
                >
                    <input
                        className="text-md w-full border-none outline-none"
                        type="text"
                        placeholder="Discover photos & videos"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="pl-2 text-xl text-black/50 cursor-pointer"
                    >
                        <IoSearch />
                    </button>
                </form>

                <Suggestions />
            </div>

            {!location.pathname.includes('/t')
                ? (
                    <>
                        {/* <FeaturedCollections /> */}
                        <Featured />

                        <h1
                            className="pt-2 pb-3 text-3xl text-neutral-700"
                            style={{
                                fontFamily: '"PT Serif", serif'
                            }}
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