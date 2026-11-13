import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"

interface ThemeToggleProps {
    className?: string
}

export const ThemeToggle = ({ className = "" }: ThemeToggleProps) => {
    const { resolvedTheme, toggleTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={`group relative grid size-14 shrink-0 place-items-center rounded-[18px] border border-black/[0.09] bg-white/95 text-neutral-600 shadow-[0_2px_12px_rgba(35,29,22,0.035)] transition-all duration-200 hover:border-black/20 hover:bg-white hover:text-neutral-900 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-white/[0.1] dark:bg-[#1a1917] dark:text-neutral-300 dark:hover:border-white/25 dark:hover:bg-[#23211e] dark:hover:text-white dark:focus-visible:outline-neutral-300 ${className}`}
        >
            <div className="relative size-5">
                <Sun
                    size={20}
                    strokeWidth={1.8}
                    className={`absolute inset-0 transition-all duration-300 ${
                        isDark
                            ? "rotate-0 scale-100 opacity-100 text-amber-400"
                            : "-rotate-90 scale-0 opacity-0"
                    }`}
                    aria-hidden="true"
                />
                <Moon
                    size={20}
                    strokeWidth={1.8}
                    className={`absolute inset-0 transition-all duration-300 ${
                        isDark
                            ? "rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100 text-neutral-700"
                    }`}
                    aria-hidden="true"
                />
            </div>
            <span className="sr-only">
                {isDark ? "Switch to light theme" : "Switch to dark theme"}
            </span>
        </button>
    )
}

export default ThemeToggle

