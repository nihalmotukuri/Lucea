import { useEffect, useRef, type ReactNode } from "react"

interface MediaDetailModalFrameProps {
    children: ReactNode
    label: string
    onClose: () => void
}

const MediaDetailModalFrame = ({ children, label, onClose }: MediaDetailModalFrameProps) => {
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const previousOverflow = document.body.style.overflow
        const previouslyFocused = document.activeElement
        document.body.style.overflow = "hidden"

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
            if (event.key !== "Tab") return

            const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), video[controls], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
            )
            if (!focusableElements?.length) return

            const first = focusableElements[0]
            const last = focusableElements[focusableElements.length - 1]
            if (!dialogRef.current?.contains(document.activeElement)) {
                event.preventDefault()
                const edge = event.shiftKey ? last : first
                edge.focus()
            } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }
        document.addEventListener("keydown", onKeyDown)
        dialogRef.current?.querySelector<HTMLElement>("button")?.focus()

        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener("keydown", onKeyDown)
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
        }
    }, [onClose])

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/35 p-2 backdrop-blur-md sm:p-5 lg:p-7"
            onClick={event => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            {children}
        </div>
    )
}

export default MediaDetailModalFrame
