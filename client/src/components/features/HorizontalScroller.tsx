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
            {canScrollLeft && (
                <button
                    type="button"
                    aria-label={`Scroll ${label} left`}
                    onClick={() => scroll(-1)}
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-[#fdfcfb]/95 p-1.5 text-neutral-700 shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                >
                    <ChevronLeft size={18} aria-hidden="true" />
                </button>
            )}
            {canScrollRight && (
                <button
                    type="button"
                    aria-label={`Scroll ${label} right`}
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/10 bg-[#fdfcfb]/95 p-1.5 text-neutral-700 shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                >
                    <ChevronRight size={18} aria-hidden="true" />
                </button>
            )}
        </div>
    )
}

export default HorizontalScroller
