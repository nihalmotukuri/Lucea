import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import type { LucideIcon } from "lucide-react"
import { Check, ChevronDown } from "lucide-react"

export interface SearchFilterOption {
    value: string
    label: string
    description: string
    icon: LucideIcon
}

interface SearchFilterDropdownProps {
    label: string
    value: string
    options: SearchFilterOption[]
    onChange: (value: string) => void
}

const SearchFilterDropdown = ({ label, value, options, onChange }: SearchFilterDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
    const selectedOption = options.find(option => option.value === value) ?? options[0]

    useEffect(() => {
        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
        }
        document.addEventListener("pointerdown", closeOnOutsideClick)
        return () => document.removeEventListener("pointerdown", closeOnOutsideClick)
    }, [])

    const chooseOption = (option: SearchFilterOption) => {
        onChange(option.value)
        setIsOpen(false)
        triggerRef.current?.focus()
    }

    const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            event.preventDefault()
            setIsOpen(false)
            triggerRef.current?.focus()
            return
        }

        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
        event.preventDefault()
        const direction = event.key === "ArrowDown" ? 1 : -1
        const nextIndex = (activeIndex + direction + options.length) % options.length
        setActiveIndex(nextIndex)
        optionRefs.current[nextIndex]?.focus()
    }

    return (
        <div ref={containerRef} className="relative min-w-0">
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => {
                    if (!isOpen) setActiveIndex(options.findIndex(option => option.value === value))
                    setIsOpen(open => !open)
                }}
                onKeyDown={event => {
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault()
                        setIsOpen(true)
                        const selectedIndex = options.findIndex(option => option.value === value)
                        const direction = event.key === "ArrowDown" ? 1 : -1
                        const nextIndex = (selectedIndex + direction + options.length) % options.length
                        setActiveIndex(nextIndex)
                        window.setTimeout(() => optionRefs.current[nextIndex]?.focus(), 0)
                    }
                }}
                className={`group flex min-h-8 w-full items-center gap-1.5 border-b px-1 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:min-h-9 sm:gap-2 ${
                    isOpen ? "border-neutral-700 dark:border-neutral-300" : "border-transparent hover:border-black/20 dark:hover:border-white/20"
                }`}
            >
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 sm:text-[11px]">{label}</span>
                <span className="min-w-0 truncate text-xs font-medium text-neutral-800 dark:text-neutral-200 sm:text-[13px]">
                    {selectedOption.label}
                </span>
                <ChevronDown
                    size={12}
                    className={`shrink-0 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    aria-label={label}
                    onKeyDown={handleMenuKeyDown}
                    onBlur={event => {
                        if (!event.relatedTarget || !containerRef.current?.contains(event.relatedTarget as Node)) {
                            setIsOpen(false)
                        }
                    }}
                    className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-[0_14px_38px_rgba(35,29,22,0.12)] dark:border-white/10 dark:bg-[#1a1917]"
                >
                    {options.map((option, index) => {
                        const OptionIcon = option.icon
                        const isSelected = option.value === value
                        return (
                            <button
                                key={option.value}
                                ref={element => { optionRefs.current[index] = element }}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onFocus={() => setActiveIndex(index)}
                                onClick={() => chooseOption(option)}
                                className={`flex min-h-12 w-full items-center gap-2.5 rounded-xl px-2 text-left transition focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-neutral-500 sm:min-h-[54px] sm:gap-3 sm:px-2.5 ${
                                    isSelected ? "bg-[#f6f3ee] dark:bg-[#282420]" : "hover:bg-[#faf8f5] dark:hover:bg-[#221f1c]"
                                }`}
                            >
                                <span className={`grid size-7 shrink-0 place-items-center rounded-lg sm:size-8 ${
                                    isSelected ? "bg-white text-neutral-800 shadow-sm dark:bg-[#34302b] dark:text-neutral-100" : "bg-[#f7f5f1] text-neutral-500 dark:bg-[#25221e] dark:text-neutral-400"
                                }`}>
                                    <OptionIcon size={13} className="sm:size-[15px]" strokeWidth={1.7} aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className={`block text-xs sm:text-sm ${isSelected ? "font-medium text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"}`}>
                                        {option.label}
                                    </span>
                                    <span className="block truncate text-[11px] text-neutral-400 dark:text-neutral-500 sm:text-xs">{option.description}</span>
                                </span>
                                {isSelected && <Check size={14} className="shrink-0 text-neutral-700 dark:text-neutral-300 sm:size-[15px]" aria-hidden="true" />}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SearchFilterDropdown
