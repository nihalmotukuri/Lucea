import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SearchBar from "@/components/features/SearchBar"
import ThemeToggle from "@/components/features/ThemeToggle"
import AccountButton from "@/components/layout/AccountButton"
import Suggestions from "@/pages/home/Suggestions"

const MediaDetailPageHeader = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate()

    const onSearch = (searchTerm: string) => {
        const query = searchTerm.trim()
        if (!query) return
        navigate(`/search?query=${encodeURIComponent(query)}&type=photos`)
    }

    return (
        <div className="fixed top-0 right-0 left-0 z-20 border-b border-black/10 bg-[#fdfcfb]/95 px-4 pt-4 backdrop-blur-md md:left-[80px] md:px-5 md:pt-5 dark:border-white/10 dark:bg-[#121110]/95">
            <div className="flex items-center gap-2.5">
                <div className="flex-1 min-w-0">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearch} />
                </div>
                <ThemeToggle />
                <AccountButton />
            </div>
            <Suggestions />
        </div>
    )
}

export default MediaDetailPageHeader
