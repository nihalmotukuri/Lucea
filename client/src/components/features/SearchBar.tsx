import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onSubmit: (query: string) => void
    placeholder?: string
}

const SEARCH_IDEAS = [
    "birds nature",
    "birds flying",
    "birds in the sky",
    "birds in flight",
    "birds chirping",
    "nature photography",
    "nature at golden hour",
    "nature details",
    "vintage film photography",
    "vintage interiors",
    "vintage objects",
    "architecture details",
    "modern architecture",
    "landscape photography",
    "mountain landscape",
    "street photography",
    "portrait photography",
    "abstract forms",
]

const QUICK_TOPICS = [
    "Golden hour",
    "Vintage film",
    "Nature",
    "Architecture",
    "Portraits",
    "Abstract",
]

const COMPLETIONS = ["photography", "aesthetic", "in nature", "at golden hour", "close up"]
const DEBOUNCE_MS = 260

const getSuggestions = (query: string) => {
    const normalized = query.trim().replace(/\s+/g, " ")
    if (!normalized) return []

    const lowerQuery = normalized.toLocaleLowerCase()
    const curated = SEARCH_IDEAS.filter(idea =>
        idea.toLocaleLowerCase().startsWith(lowerQuery) && idea.toLocaleLowerCase() !== lowerQuery
    )
    const generated = COMPLETIONS
        .map(completion => `${normalized} ${completion}`)
        .filter(idea => idea.toLocaleLowerCase() !== lowerQuery)

    return [normalized, ...curated, ...generated]
        .filter((idea, index, ideas) =>
            ideas.findIndex(candidate => candidate.toLocaleLowerCase() === idea.toLocaleLowerCase()) === index
        )
        .slice(0, 6)
}

const SearchBar = ({
    value,
    onChange,
    onSubmit,
    placeholder = "Search photos, videos, moods…",
}: SearchBarProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [debouncedValue, setDebouncedValue] = useState(value)
    const [activeIndex, setActiveIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const submitRef = useRef<HTMLButtonElement>(null)
    const listboxId = useId()
    const normalizedValue = value.trim().replace(/\s+/g, " ")

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedValue(value), DEBOUNCE_MS)
        return () => window.clearTimeout(timer)
    }, [value])

    useEffect(() => {
        setActiveIndex(-1)
    }, [debouncedValue])

    useEffect(() => {
        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
                setActiveIndex(-1)
            }
        }
        document.addEventListener("pointerdown", closeOnOutsideClick)
        return () => document.removeEventListener("pointerdown", closeOnOutsideClick)
    }, [])

    const suggestions = useMemo(() => getSuggestions(debouncedValue), [debouncedValue])
    const showSuggestions = normalizedValue.length > 0 && normalizedValue === debouncedValue.trim().replace(/\s+/g, " ")

    const submitQuery = (query: string) => {
        const trimmedQuery = query.trim().replace(/\s+/g, " ")
        if (!trimmedQuery) return

        setIsOpen(false)
        setActiveIndex(-1)
        inputRef.current?.blur()
        submitRef.current?.blur()
        onSubmit(trimmedQuery)
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        submitQuery(value)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            setIsOpen(false)
            setActiveIndex(-1)
            inputRef.current?.blur()
            return
        }

        if (!isOpen || !showSuggestions || suggestions.length === 0) return
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            const direction = event.key === "ArrowDown" ? 1 : -1
            const nextIndex = activeIndex === -1
                ? (direction === 1 ? 0 : suggestions.length - 1)
                : (activeIndex + direction + suggestions.length) % suggestions.length
            setActiveIndex(nextIndex)
        } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault()
            submitQuery(suggestions[activeIndex])
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
                    id={`${listboxId}-input`}
                    aria-label="Search photos and videos"
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    aria-expanded={isOpen && showSuggestions}
                    aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
                    className="min-w-0 flex-1 border-0 bg-transparent px-1 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus-visible:ring-0 sm:text-base"
                    type="text"
                    autoComplete="off"
                    placeholder={placeholder}
                    value={value}
                    onFocus={() => setIsOpen(true)}
                    onChange={event => {
                        onChange(event.target.value)
                        setActiveIndex(-1)
                        setIsOpen(true)
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        setIsOpen(false)
                        setActiveIndex(-1)
                    }}
                />
                {value && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                            onChange("")
                            setActiveIndex(-1)
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
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(35,29,22,0.12)]">
                    {showSuggestions ? (
                        <div className="p-2.5 sm:p-3">
                            <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                                Search ideas
                            </p>
                            <ul id={listboxId} role="listbox" aria-label="Search suggestions" className="max-h-60 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={suggestion}
                                        id={`${listboxId}-option-${index}`}
                                        role="option"
                                        aria-selected={activeIndex === index}
                                    >
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onMouseDown={event => event.preventDefault()}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onClick={() => submitQuery(suggestion)}
                                            className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-2.5 text-left text-sm transition ${
                                                activeIndex === index
                                                    ? "bg-[#f6f3ee] text-neutral-900"
                                                    : "text-neutral-700 hover:bg-[#f8f6f2]"
                                            }`}
                                        >
                                            <Search size={15} strokeWidth={1.7} className="shrink-0 text-neutral-400" aria-hidden="true" />
                                            <span className="min-w-0 flex-1 truncate">
                                                <span className="font-medium text-neutral-900">{normalizedValue}</span>
                                                {suggestion.slice(normalizedValue.length)}
                                            </span>
                                            <ArrowUpRight size={14} className="shrink-0 text-neutral-300" aria-hidden="true" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 border-t border-black/[0.06] px-2 pt-2.5">
                                <p className="pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                                    Explore a mood
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_TOPICS.slice(0, 4).map(topic => (
                                        <button
                                            key={topic}
                                            type="button"
                                            onMouseDown={event => event.preventDefault()}
                                            onClick={() => submitQuery(topic)}
                                            className="min-h-7 rounded-full border border-black/[0.07] px-2.5 text-[11px] text-neutral-500 transition hover:border-black/[0.15] hover:bg-[#f8f6f2] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 sm:p-4">
                            <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                                Explore a mood
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {QUICK_TOPICS.map(topic => (
                                    <button
                                        key={topic}
                                        type="button"
                                        onMouseDown={event => event.preventDefault()}
                                        onClick={() => submitQuery(topic)}
                                        className="min-h-8 rounded-full border border-black/[0.08] px-3 text-xs text-neutral-600 transition hover:border-black/[0.16] hover:bg-[#f8f6f2] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="border-t border-black/[0.06] px-4 py-2 text-[10px] text-neutral-400">
                        Use ↑ ↓ to browse · Enter to search
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchBar
