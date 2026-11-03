import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RecommendCollections from "./RecommendCollections"
import Suggestions from "../home/Suggestions"
import SearchBar from "@/components/features/SearchBar"

const Explore = () => {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const query = searchQuery.trim()
        if (!query) return

        navigate(`/search?query=${encodeURIComponent(query)}&type=photos`)
    }

    return (
        <div className="relative bg-[#fdfcfb] min-h-screen px-[18px] pb-[24px] pt-[132px]">
            <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb] px-4 pt-4 md:left-[80px] md:px-5 md:pt-5">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearchMedia} />

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