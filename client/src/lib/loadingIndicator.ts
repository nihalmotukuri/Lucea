import { useEffect, useRef, useState } from "react"

export const fullScreenLoadingClass = "relative left-1/2 min-h-screen w-screen -translate-x-1/2 bg-[#fdfcfb] dark:bg-[#121110] md:-translate-x-[calc(50%+40px)]"

export const useMinimumLoading = (isLoading: boolean, minimumVisibleMs = 500) => {
    const [isVisible, setIsVisible] = useState(isLoading)
    const loadingStartedAt = useRef<number | null>(isLoading ? Date.now() : null)

    useEffect(() => {
        if (isLoading) {
            loadingStartedAt.current ??= Date.now()
            setIsVisible(true)
            return
        }

        if (loadingStartedAt.current === null) {
            setIsVisible(false)
            return
        }

        const remainingMs = Math.max(
            0,
            minimumVisibleMs - (Date.now() - loadingStartedAt.current),
        )
        const timeout = window.setTimeout(() => {
            loadingStartedAt.current = null
            setIsVisible(false)
        }, remainingMs)

        return () => window.clearTimeout(timeout)
    }, [isLoading, minimumVisibleMs])

    return isVisible
}
