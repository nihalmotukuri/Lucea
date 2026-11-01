import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { IoSearch } from "react-icons/io5"
import RecommendCollections from "./RecommendCollections"
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
            <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb] px-4 pt-4 md:left-[80px] md:px-5 md:pt-5">
                <form
                    onSubmit={onSearchMedia}
                    className="relative h-[50px] w-full p-[16px] rounded-2xl flex items-center border border-black/10"
                >
                    <input
                        aria-label="Search photos and videos"
                        className="text-md w-full border-none outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                        type="text"
                        placeholder="Discover photos & videos"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />

                    <button
                        type="submit"
                        aria-label="Search"
                        className="pl-2 text-xl text-black/50 cursor-pointer"
                    >
                        <IoSearch />
                    </button>
                </form>

                <Suggestions />
            </div>

            <h1
                className="pt-1 text-center text-4xl text-neutral-700 sm:text-[48px]"
            >
                Explore
            </h1>

            <p className="text-center text-xl">Stay Inspired</p>

            <RecommendCollections />
        </div>
    )
}

export default Explore