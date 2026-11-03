import { Link, NavLink } from "react-router-dom"
import { AuroraText } from "../ui/aurora-text"
import { CiBookmark, CiHome, CiCompass1 } from "react-icons/ci"

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
          className={({ isActive }) => `rounded-full border p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${isActive ? 'border-neutral-900 text-neutral-900' : 'border-black/20 text-neutral-600'}`}
        >
          <CiHome />
        </NavLink>

        <NavLink
          to='/explore'
          aria-label="Explore collections"
          className={({ isActive }) => `rounded-full border p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${isActive ? 'border-neutral-900 text-neutral-900' : 'border-black/20 text-neutral-600'}`}
        >
          <CiCompass1 />
        </NavLink>

        <NavLink
          to='/moodboards'
          aria-label="Your moodboards"
          className={({ isActive }) => `rounded-full border p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${isActive ? 'border-neutral-900 text-neutral-900' : 'border-black/20 text-neutral-600'}`}
        >
          <CiBookmark />
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar