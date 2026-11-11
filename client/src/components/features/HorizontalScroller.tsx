import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HorizontalScrollerProps {
    children: ReactNode
    label: string
}

const HorizontalScroller = ({ children, label }: HorizontalScrollerProps) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    useEffect(() => {
        const element = scrollRef.current
        if (!element) return

        const updateScrollButtons = () => {
            setCanScrollLeft(element.scrollLeft > 0)
            setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 1)
        }

        updateScrollButtons()
        element.addEventListener("scroll", updateScrollButtons, { passive: true })
        const resizeObserver = new ResizeObserver(updateScrollButtons)
        resizeObserver.observe(element)
        if (element.firstElementChild) resizeObserver.observe(element.firstElementChild)

        return () => {
            element.removeEventListener("scroll", updateScrollButtons)
            resizeObserver.disconnect()
        }
    }, [children])

    const scroll = (direction: -1 | 1) => {
        const element = scrollRef.current
        if (!element) return
        element.scrollBy({
            left: direction * Math.max(element.clientWidth * 0.75, 160),
            behavior: "smooth",
        })
    }

    return (
        <div role="group" aria-label={label} className="relative min-w-0">
            <div
                ref={scrollRef}
                className="scrollbar-hide w-full overflow-x-auto overscroll-x-contain"
            >
                {children}
            </div>
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-gradient-to-r from-[#fdfcfb] via-[#fdfcfb]/90 to-transparent dark:from-[#121110] dark:via-[#121110]/90 transition-opacity duration-300 ${
                    canScrollLeft ? "opacity-100" : "opacity-0"
                }`}
            />
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-gradient-to-l from-[#fdfcfb] via-[#fdfcfb]/90 to-transparent dark:from-[#121110] dark:via-[#121110]/90 transition-opacity duration-300 ${
                    canScrollRight ? "opacity-100" : "opacity-0"
                }`}
            />
            <button
                type="button"
                aria-label={`Scroll ${label} left`}
                tabIndex={canScrollLeft ? 0 : -1}
                onClick={() => scroll(-1)}
                className={`absolute left-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full text-neutral-700 transition-all duration-300 hover:bg-white/80 hover:text-neutral-950 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-300 dark:hover:bg-[#282522] dark:hover:text-white ${
                    canScrollLeft
                        ? "translate-x-0 opacity-100"
                        : "pointer-events-none -translate-x-1 opacity-0"
                }`}
            >
                <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
                type="button"
                aria-label={`Scroll ${label} right`}
                tabIndex={canScrollRight ? 0 : -1}
                onClick={() => scroll(1)}
                className={`absolute right-1 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full text-neutral-700 transition-all duration-300 hover:bg-white/80 hover:text-neutral-950 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-300 dark:hover:bg-[#282522] dark:hover:text-white ${
                    canScrollRight
                        ? "translate-x-0 opacity-100"
                        : "pointer-events-none translate-x-1 opacity-0"
                }`}
            >
                <ChevronRight size={17} aria-hidden="true" />
            </button>
        </div>
    )
}

export default HorizontalScroller
