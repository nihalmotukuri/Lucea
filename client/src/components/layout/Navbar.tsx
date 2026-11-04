import { Link, NavLink } from "react-router-dom"
import { AuroraText } from "../ui/aurora-text"
import { CiBookmark, CiHome, CiCompass1 } from "react-icons/ci"
import AccountButton from "./AccountButton"

const Navbar = () => {
  return (
    <header className="fixed inset-x-0 bottom-0 z-30 flex h-[68px] flex-row items-center justify-between border-t border-black/20 bg-[#fdfcfb]/95 px-5 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[80px] md:flex-col md:justify-start md:border-r md:border-t-0 md:px-0 md:py-[34px]">
      <Link
        to='/'
        className="font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-700"
        aria-label="Lucea home"
      >
        <AuroraText>LUCEA</AuroraText>
      </Link>

      <nav aria-label="Main navigation" className="flex flex-row gap-5 text-2xl md:mt-[50px] md:flex-col md:gap-[32px]">
        <NavLink
          to='/'
          end
          aria-label="Home"
          className={({ isActive }) => `grid size-[42px] place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${isActive ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-black/20 text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900'}`}
        >
          <CiHome />
        </NavLink>

        <NavLink
          to='/explore'
          aria-label="Explore collections"
          className={({ isActive }) => `grid size-[42px] place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${isActive ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-black/20 text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900'}`}
        >
          <CiCompass1 />
        </NavLink>

        <NavLink
          to='/moodboards'
          aria-label="Your moodboards"
          className={({ isActive }) => `grid size-[42px] place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${isActive ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-black/20 text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900'}`}
        >
          <CiBookmark />
        </NavLink>
      </nav>
      <div className="md:mt-auto">
        <AccountButton />
      </div>
    </header>
  )
}

export default Navbar