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
                className={`group flex min-h-9 w-full items-center gap-2 border-b px-1 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${
                    isOpen ? "border-neutral-700" : "border-transparent hover:border-black/20"
                }`}
            >
                <span className="text-[11px] text-neutral-400">{label}</span>
                <span className="min-w-0 truncate text-[13px] font-medium text-neutral-800">
                    {selectedOption.label}
                </span>
                <ChevronDown
                    size={13}
                    className={`shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
                    className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-[0_14px_38px_rgba(35,29,22,0.12)]"
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
                                className={`flex min-h-[54px] w-full items-center gap-3 rounded-xl px-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-neutral-500 ${
                                    isSelected ? "bg-[#f6f3ee]" : "hover:bg-[#faf8f5]"
                                }`}
                            >
                                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                                    isSelected ? "bg-white text-neutral-800 shadow-sm" : "bg-[#f7f5f1] text-neutral-500"
                                }`}>
                                    <OptionIcon size={15} strokeWidth={1.7} aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className={`block text-sm ${isSelected ? "font-medium text-neutral-900" : "text-neutral-700"}`}>
                                        {option.label}
                                    </span>
                                    <span className="block truncate text-xs text-neutral-400">{option.description}</span>
                                </span>
                                {isSelected && <Check size={15} className="shrink-0 text-neutral-700" aria-hidden="true" />}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SearchFilterDropdown
