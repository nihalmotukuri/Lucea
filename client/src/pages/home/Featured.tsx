import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"

const vintagePaths = [
    {
        title: "Analog portraits",
        query: "analog portrait photography",
        image: "https://images.pexels.com/photos/851584/pexels-photo-851584.jpeg?auto=compress&cs=tinysrgb&w=720",
        note: "Faces in soft focus",
    },
    {
        title: "Classic cars",
        query: "classic vintage cars",
        image: "https://images.pexels.com/photos/2097278/pexels-photo-2097278.jpeg?auto=compress&cs=tinysrgb&w=720",
        note: "Chrome & open roads",
    },
    {
        title: "Collected objects",
        query: "vintage collected objects",
        image: "https://images.pexels.com/photos/2323654/pexels-photo-2323654.jpeg?auto=compress&cs=tinysrgb&w=720",
        note: "A life in details",
    },
    {
        title: "Warm interiors",
        query: "warm vintage interiors",
        image: "https://images.pexels.com/photos/3021322/pexels-photo-3021322.jpeg?auto=compress&cs=tinysrgb&w=720",
        note: "Rooms with a past",
    },
    {
        title: "Faded color",
        query: "faded film color photography",
        image: "https://images.pexels.com/photos/5504105/pexels-photo-5504105.jpeg?auto=compress&cs=tinysrgb&w=720",
        note: "The charm of imperfection",
    },
    {
        title: "Old-world craft",
        query: "old world vintage craftsmanship",
        image: "https://images.pexels.com/photos/9890091/pexels-photo-9890091.jpeg?auto=compress&cs=tinysrgb&w=720",
        note: "Made to be kept",
    },
]

const Featured = () => (
    <section aria-labelledby="featured-edit-title" className="my-5 sm:my-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                The Lucea field note <span className="mx-1 text-neutral-300">/</span> No. 01
            </p>
            <p className="text-xs text-neutral-500">Six ways into a vintage mood</p>
        </div>

        <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
            <Link
                to="/search?query=vintage%20aesthetic&type=photos"
                aria-label="Explore the Vintage Edit: timeless scenes, analog color, and details worth keeping"
                className="group relative flex min-h-[300px] w-full overflow-hidden rounded-[28px] bg-cover bg-center text-white outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/20 sm:min-h-[350px] md:min-h-[390px] md:w-[55%] md:rounded-[36px]"
                style={{
                    backgroundImage: "linear-gradient(90deg, rgba(20,19,16,.68), rgba(20,19,16,.04) 95%), linear-gradient(0deg, rgba(20,19,16,.48), transparent 68%), url(https://images.pexels.com/photos/9965687/pexels-photo-9965687.jpeg?auto=compress&cs=tinysrgb&w=1600)",
                }}
            >
                <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/[0.08]" aria-hidden="true" />
                <div className="relative flex w-full flex-col items-start justify-between p-5 sm:p-7 md:p-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/15 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                        A visual story <span className="size-1 rounded-full bg-[#d9c5a1]" aria-hidden="true" /> Curated by Lucea
                    </span>
                    <div className="max-w-[35rem]">
                        <h1
                            id="featured-edit-title"
                            className="max-w-[10ch] text-[clamp(3rem,8vw,6.6rem)] leading-[0.92] tracking-[-0.045em] drop-shadow-sm"
                            style={{ fontFamily: '"Playfair Display", serif' }}
                        >
                            The Vintage Edit
                        </h1>
                        <p className="mt-4 max-w-md text-sm leading-6 text-white/85 sm:text-base">
                            Timeworn textures, analog color, and the beauty of things that last.
                        </p>
                        <span className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-neutral-900 transition group-hover:bg-[#f1e8da]">
                            Explore the edit
                            <ArrowUpRight size={16} aria-hidden="true" />
                        </span>
                    </div>
                </div>
            </Link>

            <div className="grid min-h-[370px] flex-1 grid-cols-2 grid-rows-3 gap-2 sm:grid-cols-3 sm:grid-rows-2 md:min-h-[390px]">
                {vintagePaths.map((path, index) => (
                    <Link
                        key={path.title}
                        to={`/search?query=${encodeURIComponent(path.query)}&type=photos`}
                        aria-label={`Explore ${path.title}: ${path.note}`}
                        className="group relative min-h-[112px] overflow-hidden rounded-[22px] bg-neutral-200 outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/20 sm:rounded-[24px]"
                    >
                        <img
                            src={path.image}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/5 transition-colors group-hover:from-black/80" aria-hidden="true" />
                        <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/20 px-2 py-1 text-[9px] font-medium tracking-[0.12em] text-white/85 backdrop-blur-sm sm:left-3.5 sm:top-3.5">
                            0{index + 1}
                        </span>
                        <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-1 sm:inset-x-3.5 sm:bottom-3.5">
                            <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-white sm:text-sm">{path.title}</span>
                                <span className="mt-0.5 hidden truncate text-[10px] text-white/75 sm:block">{path.note}</span>
                            </span>
                            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition group-hover:border-white group-hover:bg-white group-hover:text-neutral-900">
                                <ArrowDownRight size={15} aria-hidden="true" />
                            </span>
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    </section>
)

export default Featured
