import { useEffect, useState } from "react"
import { AnimatePresence, domAnimation, LazyMotion, m, useReducedMotion } from "motion/react"
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react"
import { Link } from "react-router-dom"

const featuredStories = [
    {
        title: "The Vintage Edit",
        query: "vintage aesthetic",
        image: "https://images.pexels.com/photos/9965687/pexels-photo-9965687.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
    {
        title: "Analog Portraits",
        query: "analog portrait photography",
        image: "https://images.pexels.com/photos/851584/pexels-photo-851584.jpeg?auto=compress&cs=tinysrgb&w=720",
    },
    {
        title: "Classic Cars",
        query: "classic vintage cars",
        image: "https://images.pexels.com/photos/2097278/pexels-photo-2097278.jpeg?auto=compress&cs=tinysrgb&w=720",
    },
    {
        title: "Collected Objects",
        query: "vintage collected objects",
        image: "https://images.pexels.com/photos/2323654/pexels-photo-2323654.jpeg?auto=compress&cs=tinysrgb&w=720",
    },
    {
        title: "Warm Interiors",
        query: "warm vintage interiors",
        image: "https://images.pexels.com/photos/3021322/pexels-photo-3021322.jpeg?auto=compress&cs=tinysrgb&w=720",
    },
    {
        title: "Faded Color",
        query: "faded film color photography",
        image: "https://images.pexels.com/photos/11065468/pexels-photo-11065468.jpeg?auto=compress&cs=tinysrgb&w=720",
    },
    {
        title: "Old World Craft",
        query: "old world vintage craftsmanship",
        image: "https://images.pexels.com/photos/9890091/pexels-photo-9890091.jpeg?auto=compress&cs=tinysrgb&w=720",
    },
]

const AUTO_ADVANCE_MS = 6500

const getSearchLink = (query: string) => `/search?query=${encodeURIComponent(query)}&type=photos`

const Featured = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(true)
    const [isInteracting, setIsInteracting] = useState(false)
    const prefersReducedMotion = useReducedMotion()
    const activeStory = featuredStories[activeIndex]
    const visibleStories = featuredStories.map((_, offset) =>
        featuredStories[(activeIndex + offset) % featuredStories.length]
    )

    useEffect(() => {
        if (prefersReducedMotion || !isPlaying || isInteracting) return

        const timer = window.setTimeout(() => {
            setActiveIndex(index => (index + 1) % featuredStories.length)
        }, AUTO_ADVANCE_MS)

        return () => window.clearTimeout(timer)
    }, [activeIndex, isInteracting, isPlaying, prefersReducedMotion])

    const move = (direction: -1 | 1) => {
        setActiveIndex(index => (index + direction + featuredStories.length) % featuredStories.length)
    }

    return (
        <LazyMotion features={domAnimation}>
        <section
            aria-label="Featured visual stories"
            aria-roledescription="carousel"
            className="mt-2 mb-4 sm:mt-3 sm:mb-5"
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onFocusCapture={() => setIsInteracting(true)}
            onBlurCapture={event => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setIsInteracting(false)
                }
            }}
        >
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500 sm:text-[11px]">
                    The Lucea field note
                </p>
                <div className="flex items-center gap-1">
                    <span className="mr-2 font-mono text-[11px] tabular-nums text-neutral-500" aria-label={`Story ${activeIndex + 1} of ${featuredStories.length}`}>
                        {String(activeIndex + 1).padStart(2, "0")} <span className="text-neutral-300">/</span> {String(featuredStories.length).padStart(2, "0")}
                    </span>
                    {!prefersReducedMotion && (
                        <button
                            type="button"
                            aria-label={isPlaying ? "Pause featured stories" : "Play featured stories"}
                            onClick={() => {
                                setIsPlaying(playing => !playing)
                                setIsInteracting(false)
                            }}
                            className="grid size-8 place-items-center rounded-full text-neutral-500 transition hover:bg-black/[0.05] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                        >
                            {isPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
                        </button>
                    )}
                    <button
                        type="button"
                        aria-label="Previous featured story"
                        onClick={() => move(-1)}
                        className="grid size-8 place-items-center rounded-full text-neutral-600 transition hover:bg-black/[0.05] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next featured story"
                        onClick={() => move(1)}
                        className="grid size-8 place-items-center rounded-full text-neutral-600 transition hover:bg-black/[0.05] hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                    >
                        <ArrowRight size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
                <AnimatePresence mode="wait" initial={false}>
                    <m.div
                        key={activeStory.title}
                        initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                        className="min-h-[300px] w-full sm:min-h-[350px] md:min-h-[390px] md:w-[55%]"
                    >
                        <Link
                            to={getSearchLink(activeStory.query)}
                            aria-label={`Explore ${activeStory.title}`}
                            className="group relative flex h-full min-h-[300px] w-full overflow-hidden rounded-[24px] bg-neutral-900 bg-cover bg-center text-white outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/20 sm:min-h-[350px] md:min-h-[390px] md:rounded-[28px]"
                            style={{
                                backgroundImage: `linear-gradient(90deg, rgba(20,19,16,.48), rgba(20,19,16,.02) 95%), linear-gradient(0deg, rgba(20,19,16,.4), transparent 68%), url(${activeStory.image.replace("w=720", "w=1600")})`,
                            }}
                        >
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.08]"
                            />
                            <span className="absolute left-5 top-5 rounded-full border border-white/35 bg-black/15 px-3 py-1.5 font-mono text-[11px] text-white/90 backdrop-blur-sm sm:left-7 sm:top-7">
                                01
                            </span>
                            <span className="relative mt-auto flex w-full items-end justify-between gap-4 p-5 sm:p-7 md:p-8">
                                <m.span
                                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: prefersReducedMotion ? 0 : 0.32, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
                                    className="max-w-[12ch] text-[clamp(2.6rem,6.6vw,5.8rem)] leading-[0.92] tracking-[-0.045em] drop-shadow-sm"
                                    style={{ fontFamily: '"Playfair Display", serif' }}
                                >
                                    {activeStory.title}
                                </m.span>
                                <m.span
                                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: prefersReducedMotion ? 0 : 0.25, delay: prefersReducedMotion ? 0 : 0.16, ease: "easeOut" }}
                                    className="mb-1 inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-neutral-900 transition-colors group-hover:bg-[#f1e8da]"
                                >
                                    Explore
                                    <ArrowUpRight size={16} aria-hidden="true" />
                                </m.span>
                            </span>
                        </Link>
                    </m.div>
                </AnimatePresence>

                <div className="grid min-h-[300px] flex-1 grid-cols-2 grid-rows-3 gap-2 sm:min-h-[350px] sm:grid-cols-3 sm:grid-rows-2 md:min-h-[390px]">
                    {visibleStories.slice(1).map((story, index) => (
                            <div
                                key={story.title}
                                className="min-h-[92px] sm:min-h-[112px]"
                            >
                                <Link
                                    to={getSearchLink(story.query)}
                                    aria-label={`Explore ${story.title}`}
                                    className="group relative block h-full min-h-[92px] overflow-hidden rounded-[16px] bg-neutral-200 outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/20 sm:min-h-[112px] sm:rounded-[20px]"
                                >
                                    <img
                                        src={story.image}
                                        alt=""
                                        loading={index < 3 ? "eager" : "lazy"}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent transition-colors group-hover:from-black/75" aria-hidden="true" />
                                    <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/20 px-2 py-1 font-mono text-[10px] text-white/90 backdrop-blur-sm sm:left-3.5 sm:top-3.5">
                                        {String(index + 2).padStart(2, "0")}
                                    </span>
                                    <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-1 sm:inset-x-3.5 sm:bottom-3.5">
                                        <span className="min-w-0">
                                            <span className="block truncate text-[11px] font-semibold text-white sm:text-[13px]">{story.title}</span>
                                        </span>
                                        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition group-hover:border-white group-hover:bg-white group-hover:text-neutral-900">
                                            <ArrowDownRight size={15} aria-hidden="true" />
                                        </span>
                                    </span>
                                </Link>
                            </div>
                        ))}
                </div>
            </div>
        </section>
        </LazyMotion>
    )
}

export default Featured
