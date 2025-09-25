// import { useState } from "react"
import { useSearchMode } from "@/store/useSearchMode"
import { AuroraText } from "../ui/aurora-text"

// const searchModes = ['Go Deeper', 'Direct Search']

const SearchModeDropdown = () => {
    const searchMode = useSearchMode(state => state.searchMode)
    const searchModes = useSearchMode(state => state.searchModes)
    const showSearchModeDropdown = useSearchMode(state => state.showSearchModeDropdown)
    const setSearchMode = useSearchMode(state => state.setSearchMode)
    const setShowSearchModeDropdown = useSearchMode(state => state.setShowSearchModeDropdown)

    return (
        <div
            className="absolute top-0 bottom-0 left-0 w-[133px] flex justify-center items-center border-r border-black/20 cursor-pointer text-black/50"
            onMouseEnter={() => setShowSearchModeDropdown(true)}
            onMouseLeave={() => setShowSearchModeDropdown(false)}
        >
            {searchMode === 'Go Deeper'
                ? <AuroraText>Go Deeper</AuroraText>
                : <span className="text-slate-800">Direct Search</span>
            }

            {showSearchModeDropdown && (
                <ul className="absolute w-[160px] p-1 top-[50px] bg-white/20 backdrop-blur border border-black/10 rounded-lg">
                    {searchModes.map((sm: string, idx: number) => (
                        <li
                            key={idx}
                            className="px-2 py-1 cursor-pointer hover:bg-black/60 hover:text-white rounded-sm text-black/60"
                            onClick={() => {
                                setSearchMode(sm)
                                setShowSearchModeDropdown(false)
                            }}
                        >{sm}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default SearchModeDropdown