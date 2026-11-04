import { Link, NavLink } from "react-router-dom"
import { Bookmark, House } from "lucide-react"
import AccountButton from "./AccountButton"
import { AuroraText } from "../ui/aurora-text"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `group relative flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 md:min-h-11 md:w-full md:flex-row md:justify-center md:gap-1 md:px-0.5 ${
    isActive
      ? "text-neutral-900"
      : "text-neutral-400 hover:text-neutral-800"
  }`

const Navbar = () => {
  return (
    <header className="fixed inset-x-0 bottom-0 z-30 grid h-[68px] grid-cols-[1fr_auto_1fr] items-center border-t border-black/[0.08] bg-[#fdfcfb]/95 px-4 backdrop-blur-md md:inset-y-0 md:left-0 md:right-auto md:flex md:h-screen md:w-[80px] md:flex-col md:items-center md:border-r md:border-t-0 md:px-2 md:py-7">
      <Link
        to="/"
        className="justify-self-start rounded-lg text-[15px] font-semibold tracking-[0.12em] text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-700 md:justify-self-auto"
        aria-label="Lucea home"
      >
        <AuroraText>LUCEA</AuroraText>
      </Link>

      <nav aria-label="Main navigation" className="flex items-center gap-4 md:mt-12 md:w-full md:flex-col md:gap-4">
        <NavLink
          to="/"
          end
          aria-label="Home"
          title="Home"
          className={navLinkClass}
        >
          {({ isActive }) => (
            <>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-200 motion-safe:group-hover:scale-105 md:size-12 ${
                isActive ? "bg-[#f3eee7] text-neutral-900" : "group-hover:bg-black/[0.035]"
              }`}>
                <House size={18} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="sr-only">Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/moodboards"
          aria-label="Your moodboards"
          title="Your moodboards"
          className={navLinkClass}
        >
          {({ isActive }) => (
            <>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-200 motion-safe:group-hover:scale-105 md:size-12 ${
                isActive ? "bg-[#f3eee7] text-neutral-900" : "group-hover:bg-black/[0.035]"
              }`}>
                <Bookmark size={18} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="sr-only">Saved</span>
            </>
          )}
        </NavLink>
      </nav>
      <div className="justify-self-end md:mt-auto md:justify-self-auto">
        <AccountButton />
      </div>
    </header>
  )
}

export default Navbar