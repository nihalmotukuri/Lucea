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
    const showQuerySuggestions = showRelatedSearches
        && normalizedValue.length >= 2
        && normalizedValue === debouncedValue.trim().replace(/\s+/g, " ")
    const hasSuggestions = recentSearches.length > 0 || showQuerySuggestions

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
                className="group flex min-h-12 w-full items-center gap-1.5 rounded-[14px] border border-black/[0.09] bg-white/95 p-1 shadow-[0_2px_12px_rgba(35,29,22,0.035)] transition duration-200 hover:border-black/[0.15] focus-within:border-neutral-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-neutral-900/[0.04] sm:min-h-14 sm:gap-2 sm:rounded-[16px] sm:p-1.5 dark:border-white/[0.1] dark:bg-[#1a1917]/95 dark:focus-within:border-neutral-500 dark:focus-within:bg-[#1a1917] dark:focus-within:ring-white/[0.04]"
            >
                <span className="ml-1 hidden size-9 shrink-0 place-items-center rounded-[12px] bg-[#f4f0e9] text-neutral-600 transition-colors group-focus-within:bg-[#eee7dc] group-focus-within:text-neutral-900 sm:grid sm:size-10 dark:bg-[#262421] dark:text-neutral-300 dark:group-focus-within:bg-[#2f2b27] dark:group-focus-within:text-white">
                    <Search size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <input
                    ref={inputRef}
                    aria-label="Search photos and videos"
                    aria-expanded={isOpen && hasSuggestions}
                    className="min-w-0 flex-1 border-0 bg-transparent px-1 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus-visible:ring-0 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:text-base"
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
                {!value && !isOpen && (
                    <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded-md border border-black/[0.08] bg-[#f8f6f2] px-2 font-mono text-[11px] font-medium text-neutral-400 dark:border-white/[0.08] dark:bg-[#262421] dark:text-neutral-400">
                        /
                    </kbd>
                )}
                {value && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                            onChange("")
                            setIsOpen(true)
                            inputRef.current?.focus()
                        }}
                        className="grid size-8 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-black/[0.05] hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:size-9 dark:text-neutral-500 dark:hover:bg-white/[0.08] dark:hover:text-white"
                    >
                        <X size={14} aria-hidden="true" />
                    </button>
                )}
                <button
                    ref={submitRef}
                    type="submit"
                    disabled={!value.trim()}
                    aria-label="Search"
                    className="group/search inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] bg-neutral-900 px-3 text-xs font-medium text-white shadow-xs transition duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#eeeae3] disabled:text-neutral-400 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800 sm:min-h-10 sm:gap-2 sm:rounded-[12px] sm:px-4 sm:text-sm dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:disabled:bg-[#282522] dark:disabled:text-neutral-600"
                >
                    <span className="hidden sm:inline">Search</span>
                    <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" className="transition-transform duration-200 group-hover/search:translate-x-0.5 sm:size-[17px]" />
                </button>
            </form>

            {isOpen && hasSuggestions && (
                <div
                    role="region"
                    aria-label="Search suggestions"
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 flex max-h-[min(75vh,600px)] flex-col gap-3 overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-3 shadow-[0_12px_36px_rgba(35,29,22,0.12)] dark:border-white/[0.09] dark:bg-[#1a1917] dark:text-neutral-100 sm:gap-4 sm:p-4"
                >
                    {recentSearches.length > 0 && (
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Recent searches</p>
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
                                    className="rounded px-1 py-0.5 text-xs text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
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
                                        className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 text-[13px] text-neutral-700 transition hover:border-black/[0.16] hover:bg-[#f8f6f2] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-white/[0.08] dark:bg-[#24211e] dark:text-neutral-300 dark:hover:bg-[#2c2824] dark:hover:text-white"
                                    >
                                        <Clock3 size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
                                        <span className="max-w-56 truncate">{search}</span>
                                        <Search size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {showQuerySuggestions
                        && <SearchRecommendations urlQuery={normalizedValue} onSelect={submitQuery} />
                    }
                    {showQuerySuggestions
                        && <RelatedMoodboards query={normalizedValue} />
                    }
                </div>
            )}
        </div>
    )
}

export default SearchBar
