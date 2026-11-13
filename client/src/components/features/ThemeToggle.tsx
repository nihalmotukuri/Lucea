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
            className={`group relative grid size-10 md:size-12 shrink-0 place-items-center rounded-xl text-neutral-500 transition-all duration-200 hover:bg-black/[0.035] hover:text-neutral-900 motion-safe:hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white dark:focus-visible:outline-neutral-300 ${className}`}
        >
            <div className="relative size-[18px] md:size-5">
                <Sun
                    size={18}
                    strokeWidth={1.7}
                    className={`absolute inset-0 transition-all duration-300 md:size-5 ${
                        isDark
                            ? "rotate-0 scale-100 opacity-100 text-amber-400"
                            : "-rotate-90 scale-0 opacity-0"
                    }`}
                    aria-hidden="true"
                />
                <Moon
                    size={18}
                    strokeWidth={1.7}
                    className={`absolute inset-0 transition-all duration-300 md:size-5 ${
                        isDark
                            ? "rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100 text-neutral-700 dark:text-neutral-300"
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

