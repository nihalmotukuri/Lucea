import { useEffect, useState } from "react"

export type ThemeMode = "light" | "dark" | "system"

const THEME_STORAGE_KEY = "lucea-theme"
const THEME_EVENT = "lucea-theme-change"

const getSystemPreference = (): "dark" | "light" => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const getStoredTheme = (): ThemeMode => {
    if (typeof window === "undefined") return "system"
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") {
        return stored
    }
    return "system"
}

export const applyTheme = (mode: ThemeMode) => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    const resolved = mode === "system" ? getSystemPreference() : mode

    if (resolved === "dark") {
        root.classList.add("dark")
        root.style.colorScheme = "dark"
    } else {
        root.classList.remove("dark")
        root.style.colorScheme = "light"
    }
}

export const useTheme = () => {
    const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme)

    const resolvedTheme: "dark" | "light" = theme === "system" ? getSystemPreference() : theme

    useEffect(() => {
        applyTheme(theme)

        const handleStorage = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY) {
                const nextTheme = getStoredTheme()
                setThemeState(nextTheme)
                applyTheme(nextTheme)
            }
        }

        const handleCustomEvent = () => {
            const nextTheme = getStoredTheme()
            setThemeState(nextTheme)
            applyTheme(nextTheme)
        }

        const mediaQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null
        const handleSystemChange = () => {
            if (getStoredTheme() === "system") {
                applyTheme("system")
                setThemeState("system")
            }
        }

        window.addEventListener("storage", handleStorage)
        window.addEventListener(THEME_EVENT, handleCustomEvent)
        mediaQuery?.addEventListener?.("change", handleSystemChange)

        return () => {
            window.removeEventListener("storage", handleStorage)
            window.removeEventListener(THEME_EVENT, handleCustomEvent)
            mediaQuery?.removeEventListener?.("change", handleSystemChange)
        }
    }, [theme])

    const setTheme = (nextTheme: ThemeMode) => {
        setThemeState(nextTheme)
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
        } catch (error) {
            console.warn("Unable to save theme in localStorage", error)
        }
        applyTheme(nextTheme)
        window.dispatchEvent(new Event(THEME_EVENT))
    }

    const toggleTheme = () => {
        // Toggle between light and dark
        const next = resolvedTheme === "dark" ? "light" : "dark"
        setTheme(next)
    }

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
    }
}

