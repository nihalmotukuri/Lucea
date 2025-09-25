import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { IoSearch } from "react-icons/io5"
// import FeaturedCollections from "./FeaturedCollections"
import RecommendCollections from "./RecommendCollections"
// import TrendingTopics from "./TrendingTopics"
import Suggestions from "../home/Suggestions"

const Explore = () => {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!searchQuery) return null

        navigate(`/search?query=${searchQuery}&type=photos`)
    }

    return (
        <div className="relative bg-[#fdfcfb] min-h-screen px-[18px] pb-[24px] pt-[132px]">
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

            <h1
                className="pt-1 text-[48px] text-neutral-700 text-center"
                style={{
                    // fontFamily: '"PT Serif", serif'
                }}
            >
                Explore
            </h1>

            <p className="text-center text-xl">Stay Inspired</p>

            {/* <FeaturedCollections /> */}

            <RecommendCollections />

            {/* {/* <TrendingTopics /> */}
        </div>
    )
}

export default Explore