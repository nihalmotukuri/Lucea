import { useState } from "react"
import { Link } from "react-router-dom"
import {
    ArrowUpRight,
    Check,
    CircleUserRound,
    Clock3,
    Laptop,
    LogIn,
    LogOut,
    Moon,
    Play,
    Sliders,
    Sun,
    Trash2,
} from "lucide-react"
import { useTheme, type ThemeMode } from "@/hooks/useTheme"
import { useAuth } from "@/auth/useAuth"

const AUTOPLAY_PREF_KEY = "lucea.videoAutoplay"
const FEED_FILTER_PREF_KEY = "lucea.defaultFeedFilter"
const RECENT_SEARCHES_KEY = "lucea.recentSearches"

export const SettingsPage = () => {
    const { theme, setTheme } = useTheme()
    const { user, isAuthLoading, openAuthDialog, supabase } = useAuth()

    const [videoAutoplay, setVideoAutoplay] = useState<boolean>(() => {
        try {
            const stored = localStorage.getItem(AUTOPLAY_PREF_KEY)
            return stored !== null ? JSON.parse(stored) : true
        } catch {
            return true
        }
    })

    const [defaultFeed, setDefaultFeed] = useState<string>(() => {
        return localStorage.getItem(FEED_FILTER_PREF_KEY) || "all"
    })

    const [recentSearchCount, setRecentSearchCount] = useState<number>(() => {
        try {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
            return stored ? JSON.parse(stored).length : 0
        } catch {
            return 0
        }
    })

    const [toastMessage, setToastMessage] = useState<string>("")

    const showToast = (message: string) => {
        setToastMessage(message)
        window.setTimeout(() => setToastMessage(""), 2600)
    }

    const handleAutoplayChange = (enabled: boolean) => {
        setVideoAutoplay(enabled)
        try {
            localStorage.setItem(AUTOPLAY_PREF_KEY, JSON.stringify(enabled))
            showToast(enabled ? "Video hover preview enabled" : "Video hover preview disabled")
        } catch (e) {
            console.warn(e)
        }
    }

    const handleDefaultFeedChange = (feed: string) => {
        setDefaultFeed(feed)
        try {
            localStorage.setItem(FEED_FILTER_PREF_KEY, feed)
            showToast(`Default feed set to ${feed}`)
        } catch (e) {
            console.warn(e)
        }
    }

    const clearRecentSearches = () => {
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY)
            setRecentSearchCount(0)
            showToast("Search history cleared")
        } catch (e) {
            console.warn(e)
        }
    }

    const handleSignOut = async () => {
        if (!supabase) return
        await supabase.auth.signOut()
        showToast("Signed out successfully")
    }

    return (
        <div className="relative min-h-screen bg-[#fdfcfb] px-4 pb-16 pt-24 text-neutral-800 transition-colors sm:px-6 md:px-10 md:pt-14 dark:bg-[#121110] dark:text-neutral-100">
            {toastMessage && (
                <div
                    role="status"
                    className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full border border-black/10 bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-neutral-100 dark:text-neutral-900"
                >
                    {toastMessage}
                </div>
            )}

            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <header className="border-b border-black/[0.08] pb-6 dark:border-white/[0.08]">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        <Sliders size={13} aria-hidden="true" />
                        <span>Preferences</span>
                    </div>
                    <h1 className="font-editorial mt-1 text-3xl font-normal text-neutral-850 sm:text-4xl dark:text-neutral-100">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Customize your discovery experience, appearance, and local preferences.
                    </p>
                </header>

                <div className="mt-8 space-y-10">
                    {/* Section 1: Appearance & Theme */}
                    <section aria-labelledby="appearance-heading">
                        <h2 id="appearance-heading" className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-300">
                            Appearance
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            Choose how Lucea looks to you.
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {([
                                {
                                    id: "light" as ThemeMode,
                                    label: "Light",
                                    description: "Warm linen & cream tones",
                                    icon: Sun,
                                },
                                {
                                    id: "dark" as ThemeMode,
                                    label: "Dark",
                                    description: "Obsidian & amber luster",
                                    icon: Moon,
                                },
                                {
                                    id: "system" as ThemeMode,
                                    label: "System",
                                    description: "Matches your device theme",
                                    icon: Laptop,
                                },
                            ]).map(({ id, label, description, icon: Icon }) => {
                                const isSelected = theme === id
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setTheme(id)}
                                        aria-pressed={isSelected}
                                        className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ${
                                            isSelected
                                                ? "border-neutral-900 bg-white shadow-md ring-2 ring-neutral-900/10 dark:border-white dark:bg-[#1f1d1a] dark:ring-white/10"
                                                : "border-black/[0.08] bg-white/60 hover:border-black/20 hover:bg-white dark:border-white/[0.08] dark:bg-[#181615] dark:hover:border-white/20 dark:hover:bg-[#201d1b]"
                                        }`}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span className={`grid size-9 place-items-center rounded-xl ${
                                                isSelected
                                                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                                            }`}>
                                                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                                            </span>
                                            {isSelected && (
                                                <span className="grid size-5 place-items-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                                                    <Check size={12} strokeWidth={2.5} />
                                                </span>
                                            )}
                                        </div>
                                        <span className="mt-3 block text-sm font-semibold text-neutral-850 dark:text-neutral-100">
                                            {label}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                                            {description}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    {/* Section 2: Feed & Discovery Preferences */}
                    <section aria-labelledby="browsing-heading" className="border-t border-black/[0.08] pt-8 dark:border-white/[0.08]">
                        <h2 id="browsing-heading" className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-300">
                            Browsing & Media
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            Fine-tune interactions in your feed.
                        </p>

                        <div className="mt-4 space-y-3">
                            {/* Toggle Video Preview */}
                            <div className="flex items-center justify-between rounded-2xl border border-black/[0.08] bg-white p-4 dark:border-white/[0.08] dark:bg-[#1a1917]">
                                <div className="pr-4">
                                    <div className="flex items-center gap-2">
                                        <Play size={16} className="text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                            Video preview on hover
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        Silently preview videos in the feed when hovering over their cards.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={videoAutoplay}
                                    onClick={() => handleAutoplayChange(!videoAutoplay)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${
                                        videoAutoplay ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-neutral-900 ${
                                            videoAutoplay ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Default Feed View */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.08] bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-[#1a1917]">
                                <div>
                                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                        Initial feed filter
                                    </span>
                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        Which media category is active when you open explore.
                                    </p>
                                </div>
                                <div className="inline-flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
                                    {[
                                        { id: "all", label: "Everything" },
                                        { id: "photos", label: "Photos" },
                                        { id: "videos", label: "Videos" },
                                    ].map(({ id, label }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => handleDefaultFeedChange(id)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                                defaultFeed === id
                                                    ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white"
                                                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Search History & Cache */}
                    <section aria-labelledby="history-heading" className="border-t border-black/[0.08] pt-8 dark:border-white/[0.08]">
                        <h2 id="history-heading" className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-300">
                            Search History & Storage
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            Manage search memories stored locally in your browser.
                        </p>

                        <div className="mt-4 rounded-2xl border border-black/[0.08] bg-white p-4 dark:border-white/[0.08] dark:bg-[#1a1917]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock3 size={16} className="text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                                    <div>
                                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                            Recent searches
                                        </span>
                                        <span className="ml-2 text-xs text-neutral-400">
                                            ({recentSearchCount} saved)
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={recentSearchCount === 0}
                                    onClick={clearRecentSearches}
                                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-xs font-medium text-neutral-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                >
                                    <Trash2 size={13} aria-hidden="true" />
                                    Clear history
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Account & Cloud Sync */}
                    <section aria-labelledby="account-heading" className="border-t border-black/[0.08] pt-8 dark:border-white/[0.08]">
                        <h2 id="account-heading" className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-300">
                            Account & Sync
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            Your cloud profile and moodboard sync state.
                        </p>

                        <div className="mt-4 rounded-2xl border border-black/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-[#1a1917]">
                            {user ? (
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-11 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-700 dark:bg-[#282522] dark:text-neutral-200">
                                            <CircleUserRound size={22} aria-hidden="true" />
                                        </span>
                                        <div>
                                            <span className="block text-sm font-semibold text-neutral-850 dark:text-neutral-100">
                                                {user.email}
                                            </span>
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                                ● Connected & syncing moodboards
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            to="/profile"
                                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-black/10 px-3 text-xs font-medium text-neutral-700 transition hover:bg-black/[0.04] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.06]"
                                        >
                                            Creator Profile <ArrowUpRight size={14} aria-hidden="true" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => void handleSignOut()}
                                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 text-xs font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                                        >
                                            <LogOut size={13} aria-hidden="true" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <span className="text-sm font-semibold text-neutral-850 dark:text-neutral-100">
                                            Not signed in
                                        </span>
                                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                            Sign in to save moodboards across devices and share public boards.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isAuthLoading}
                                        onClick={() => openAuthDialog("Sign in to sync your moodboards across devices.")}
                                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                                    >
                                        <LogIn size={14} aria-hidden="true" />
                                        Sign in or create account
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section 5: Keyboard Shortcuts & Cheatsheet */}
                    <section aria-labelledby="shortcuts-heading" className="border-t border-black/[0.08] pt-8 dark:border-white/[0.08]">
                        <h2 id="shortcuts-heading" className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-300">
                            Keyboard Shortcuts
                        </h2>
                        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {[
                                { key: "/", action: "Focus search bar" },
                                { key: "Esc", action: "Close modals & clear search suggestions" },
                                { key: "Tab", action: "Navigate interactive media cards" },
                                { key: "Space / Enter", action: "Open media detail view" },
                            ].map(({ key, action }) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-white/70 px-3.5 py-2.5 text-xs dark:border-white/[0.06] dark:bg-[#1a1917]/70"
                                >
                                    <span className="text-neutral-600 dark:text-neutral-300">{action}</span>
                                    <kbd className="rounded-md border border-black/10 bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-medium text-neutral-700 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300">
                                        {key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 6: About & Credits */}
                    <section aria-labelledby="about-heading" className="border-t border-black/[0.08] pt-8 text-xs text-neutral-500 dark:border-white/[0.08] dark:text-neutral-400">
                        <div className="flex flex-col gap-2 rounded-2xl bg-[#f7f4ee] p-5 dark:bg-[#1c1a17]">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Lucea</span>
                                <span className="font-mono text-[11px] text-neutral-400">v1.2 · Creative Studio</span>
                            </div>
                            <p className="leading-5">
                                Visual discovery space curated with high-resolution imagery and motion powered by the{" "}
                                <a
                                    href="https://www.pexels.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium underline decoration-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                                >
                                    Pexels API
                                </a>{" "}
                                and daily inspiration sparks refreshed by Gemini.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage
