import { Link, NavLink } from "react-router-dom"
import { Bookmark, House, Settings, UserRound } from "lucide-react"
import { AuroraText } from "../ui/aurora-text"
import { useAuth } from "@/auth/useAuth"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `group relative flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 md:min-h-11 md:w-full md:flex-row md:justify-center md:gap-1 md:px-0.5 ${
    isActive
      ? "text-neutral-900 dark:text-white"
      : "text-neutral-400 hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-200"
  }`

const Navbar = () => {
  const { user } = useAuth()

  return (
    <header className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(64px+env(safe-area-inset-bottom,0px))] grid-cols-[1fr_auto_1fr] items-center border-t border-black/[0.08] bg-[#fdfcfb]/95 px-4 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:inset-y-0 md:left-0 md:right-auto md:flex md:h-screen md:w-[80px] md:flex-col md:items-center md:border-r md:border-t-0 md:px-2 md:py-7 md:pb-7 dark:border-white/[0.08] dark:bg-[#141312]/95">
      <Link
        to="/"
        className="justify-self-start rounded-lg text-[15px] font-semibold tracking-[0.12em] text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-700 dark:text-neutral-100 md:justify-self-auto"
        aria-label="Lucea home"
      >
        <AuroraText>LUCEA</AuroraText>
      </Link>

      <nav aria-label="Main navigation" className="flex items-center gap-3 md:mt-12 md:w-full md:flex-col md:gap-4">
        <NavLink
          to="/"
          end
          aria-label="Home"
          className={navLinkClass}
        >
          {({ isActive }) => (
            <>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-200 motion-safe:group-hover:scale-105 md:size-12 ${
                isActive ? "bg-[#f3eee7] text-neutral-900 dark:bg-[#282522] dark:text-white" : "group-hover:bg-black/[0.035] dark:group-hover:bg-white/[0.05]"
              }`}>
                <House size={18} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="pointer-events-none absolute left-full ml-2 hidden z-50 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 md:block dark:bg-neutral-800">
                Home
              </span>
              <span className="sr-only">Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/moodboards"
          aria-label="Your moodboards"
          className={navLinkClass}
        >
          {({ isActive }) => (
            <>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-200 motion-safe:group-hover:scale-105 md:size-12 ${
                isActive ? "bg-[#f3eee7] text-neutral-900 dark:bg-[#282522] dark:text-white" : "group-hover:bg-black/[0.035] dark:group-hover:bg-white/[0.05]"
              }`}>
                <Bookmark size={18} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="pointer-events-none absolute left-full ml-2 hidden z-50 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 md:block dark:bg-neutral-800">
                Moodboards
              </span>
              <span className="sr-only">Saved</span>
            </>
          )}
        </NavLink>

        {user && (
          <NavLink
            to="/profile"
            aria-label="Your public profile"
            className={navLinkClass}
          >
            {({ isActive }) => (
              <>
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-200 motion-safe:group-hover:scale-105 md:size-12 ${
                  isActive ? "bg-[#f3eee7] text-neutral-900 dark:bg-[#282522] dark:text-white" : "group-hover:bg-black/[0.035] dark:group-hover:bg-white/[0.05]"
                }`}>
                  <UserRound size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="pointer-events-none absolute left-full ml-2 hidden z-50 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 md:block dark:bg-neutral-800">
                  Profile
                </span>
                <span className="sr-only">Your profile</span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      {/* Settings replaces account position at the bottom of sidebar / far right on mobile */}
      <div className="justify-self-end md:mt-auto md:w-full md:justify-self-auto">
        <NavLink
          to="/settings"
          aria-label="Settings"
          className={navLinkClass}
        >
          {({ isActive }) => (
            <>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-200 motion-safe:group-hover:scale-105 md:size-12 ${
                isActive ? "bg-[#f3eee7] text-neutral-900 dark:bg-[#282522] dark:text-white" : "group-hover:bg-black/[0.035] dark:group-hover:bg-white/[0.05]"
              }`}>
                <Settings size={18} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="pointer-events-none absolute left-full ml-2 hidden z-50 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 md:block dark:bg-neutral-800">
                Settings
              </span>
              <span className="sr-only">Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </header>
  )
}

export default Navbar