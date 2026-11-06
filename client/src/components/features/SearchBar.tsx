import { useEffect, useRef, useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import { ArrowRight, Clock3, Search, X } from "lucide-react"
import SearchRecommendations from "@/pages/search/SearchRecommendations"
import RelatedMoodboards from "@/pages/search/RelatedMoodboards"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onSubmit: (query: string) => void
    placeholder?: string
    showRelatedSearches?: boolean
}

const RECENT_SEARCHES_KEY = "lucea.recentSearches"
const MAX_RECENT_SEARCHES = 5
const DEBOUNCE_MS = 260

const readRecentSearches = () => {
    try {
        const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY)
        const parsed: unknown = stored ? JSON.parse(stored) : []
        if (!Array.isArray(parsed) || !parsed.every(item => typeof item === "string")) return []
        return parsed.slice(0, MAX_RECENT_SEARCHES)
    } catch (error) {
        console.warn("Unable to read recent searches from local storage.", error)
        return []
    }
}

const SearchBar = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Search photos, videos, moods…",
    showRelatedSearches = false,
}: SearchBarProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [debouncedValue, setDebouncedValue] = useState(value)
    const [recentSearches, setRecentSearches] = useState(readRecentSearches)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const submitRef = useRef<HTMLButtonElement>(null)
    const normalizedValue = value.trim().replace(/\s+/g, " ")

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedValue(value), DEBOUNCE_MS)
        return () => window.clearTimeout(timer)
    }, [value])

    useEffect(() => {
        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("pointerdown", closeOnOutsideClick)
        return () => document.removeEventListener("pointerdown", closeOnOutsideClick)
    }, [])

    useEffect(() => {
        const focusSearchShortcut = (event: globalThis.KeyboardEvent) => {
            const target = event.target
            const isTyping = target instanceof HTMLElement
                && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
            if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || isTyping) return
            event.preventDefault()
            inputRef.current?.focus()
        }
        document.addEventListener("keydown", focusSearchShortcut)
        return () => document.removeEventListener("keydown", focusSearchShortcut)
    }, [])

    const submitQuery = (query: string) => {
        const trimmedQuery = query.trim().replace(/\s+/g, " ")
        if (!trimmedQuery) return

        setIsOpen(false)
        inputRef.current?.blur()
        submitRef.current?.blur()
        const nextRecentSearches = [
            trimmedQuery,
            ...recentSearches.filter(search => search.toLocaleLowerCase() !== trimmedQuery.toLocaleLowerCase()),
        ].slice(0, MAX_RECENT_SEARCHES)
        setRecentSearches(nextRecentSearches)
        try {
            window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextRecentSearches))
        } catch (error) {
            console.warn("Unable to save recent searches to local storage.", error)
        }
        onSubmit(trimmedQuery)
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        submitQuery(value)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            setIsOpen(false)
            inputRef.current?.blur()
        }
    }

    return (
        <div ref={containerRef} className="relative z-30 w-full">
            <form
                role="search"
                onSubmit={handleSubmit}
                className="group flex min-h-14 w-full items-center gap-2 rounded-[18px] border border-black/[0.09] bg-white/95 p-1.5 shadow-[0_2px_12px_rgba(35,29,22,0.035)] transition duration-200 hover:border-black/[0.15] focus-within:border-neutral-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-900/[0.04]"
            >
                <span className="ml-1 grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#f4f0e9] text-neutral-600 transition-colors group-focus-within:bg-[#eee7dc] group-focus-within:text-neutral-900">
                    <Search size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <input
                    ref={inputRef}
                    aria-label="Search photos and videos"
                    aria-expanded={isOpen}
                    className="min-w-0 flex-1 border-0 bg-transparent px-1 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus-visible:ring-0 sm:text-base"
                    type="text"
                    autoComplete="off"
                    placeholder={placeholder}
                    value={value}
                    onFocus={() => setIsOpen(true)}
                    onChange={event => {
                        onChange(event.target.value)
                        setIsOpen(true)
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={event => {
                        const nextTarget = event.relatedTarget
                        if (!(nextTarget instanceof Node) || !containerRef.current?.contains(nextTarget)) {
                            setIsOpen(false)
                        }
                    }}
                />
                {value && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                            onChange("")
                            setIsOpen(true)
                            inputRef.current?.focus()
                        }}
                        className="grid size-9 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-black/[0.05] hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                )}
                <button
                    ref={submitRef}
                    type="submit"
                    disabled={!value.trim()}
                    aria-label="Search"
                    className="group/search inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[13px] bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-900 px-3 text-sm font-medium text-white shadow-[0_3px_10px_rgba(30,27,75,0.16)] transition duration-200 hover:-translate-y-px hover:from-neutral-800 hover:via-indigo-900 hover:to-violet-900 hover:shadow-[0_5px_14px_rgba(30,27,75,0.22)] active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-none disabled:from-[#e8e4de] disabled:via-[#e8e4de] disabled:to-[#e8e4de] disabled:text-neutral-600 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 sm:px-4"
                >
                    <span className="hidden sm:inline">Search</span>
                    <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" className="transition-transform duration-200 group-hover/search:translate-x-0.5" />
                </button>
            </form>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 flex max-h-[min(75vh,600px)] flex-col gap-3 overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-3 shadow-[0_12px_36px_rgba(35,29,22,0.12)] sm:gap-4 sm:p-4">
                    {recentSearches.length > 0 && (
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold text-neutral-800">Recent searches</p>
                                <button
                                    type="button"
                                    onMouseDown={event => event.preventDefault()}
                                    onClick={() => {
                                        setRecentSearches([])
                                        try {
                                            window.localStorage.removeItem(RECENT_SEARCHES_KEY)
                                        } catch (error) {
                                            console.warn("Unable to clear recent searches from local storage.", error)
                                        }
                                    }}
                                    className="rounded px-1 py-0.5 text-xs text-neutral-500 transition hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map(search => (
                                    <button
                                        key={search}
                                        type="button"
                                        onMouseDown={event => event.preventDefault()}
                                        onClick={() => submitQuery(search)}
                                        className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 text-[13px] text-neutral-700 transition hover:border-black/[0.16] hover:bg-[#f8f6f2] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                    >
                                        <Clock3 size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
                                        <span className="max-w-56 truncate">{search}</span>
                                        <Search size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {showRelatedSearches
                        && normalizedValue.length >= 2
                        && normalizedValue === debouncedValue.trim().replace(/\s+/g, " ")
                        && <SearchRecommendations urlQuery={normalizedValue} onSelect={submitQuery} />
                    }
                    {showRelatedSearches
                        && normalizedValue.length >= 2
                        && normalizedValue === debouncedValue.trim().replace(/\s+/g, " ")
                        && <RelatedMoodboards query={normalizedValue} />
                    }
                </div>
            )}
        </div>
    )
}

export default SearchBar
