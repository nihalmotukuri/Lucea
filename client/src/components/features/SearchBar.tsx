import type { FormEventHandler } from "react"
import { ArrowRight, Search, X } from "lucide-react"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onSubmit: FormEventHandler<HTMLFormElement>
    placeholder?: string
}

const SearchBar = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Search photos, videos, moods…",
}: SearchBarProps) => (
    <form
        role="search"
        onSubmit={onSubmit}
        className="group flex min-h-14 w-full items-center gap-2 rounded-[20px] border border-black/[0.09] bg-white/90 p-1.5 shadow-[0_2px_12px_rgba(35,29,22,0.035)] transition duration-200 hover:border-black/[0.15] focus-within:border-neutral-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-900/[0.04]"
    >
        <span className="ml-1 grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#f4f0e9] text-neutral-600 transition-colors group-focus-within:bg-[#eee7dc] group-focus-within:text-neutral-900">
            <Search size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <input
            aria-label="Search photos and videos"
            className="min-w-0 flex-1 border-0 bg-transparent px-1 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus-visible:ring-0 sm:text-base"
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={value}
            onChange={event => onChange(event.target.value)}
        />
        {value && (
            <button
                type="button"
                aria-label="Clear search"
                onClick={() => onChange("")}
                className="grid size-9 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-black/[0.05] hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
            >
                <X size={16} aria-hidden="true" />
            </button>
        )}
        <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Search"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-neutral-900 px-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:px-4"
        >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
    </form>
)

export default SearchBar
