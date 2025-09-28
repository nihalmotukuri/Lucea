import { Link } from "react-router-dom"
import { AuroraText } from "../ui/aurora-text"
import { CiHome, CiCompass1 } from "react-icons/ci"

const Navbar = () => {
  return (
    <header className="fixed top-0 bottom-0 w-[80px] backdrop-blur border-r-1 border-black/20 flex flex-col items-center py-[34px] bg-[#fdfcfb]">
      <Link
        to='/'
        className="font-bold"
      >
        <AuroraText>LUCEA</AuroraText>
      </Link>

      <nav className="mt-[50px] text-2xl flex flex-col gap-[32px]">
        <Link
          to='/'
          className="p-2 border border-black/20 rounded-full"
        >
          <CiHome />
        </Link>

        <Link
          to='/explore'
          className="p-2 border border-black/20 rounded-full"
        >
          <CiCompass1 />
        </Link>
      </nav>
    </header>
  )
}

export default Navbar