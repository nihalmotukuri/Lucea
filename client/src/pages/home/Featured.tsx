import { useEffect, useState } from "react"
import { AnimatePresence, domAnimation, LazyMotion, m, useReducedMotion } from "motion/react"
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react"
import { Link } from "react-router-dom"

const featuredStories = [
    {
        title: "Wild Neighbors",
        description: "A quiet moment in the untamed world.",
        query: "wildlife in natural habitats",
        image: "/images/wild-neighbors.jpg",
    },
    {
        title: "Open Road",
        description: "Classic lines, endless horizons.",
        query: "classic cars on scenic roads",
        image: "/images/open-road.jpg",
    },
    {
        title: "Retro Futures",
        description: "Tomorrow, imagined through yesterday.",
        query: "retro futurism vintage design",
        image: "/images/retro-futures.jpg",
    },
    {
        title: "Birds in Flight",
        description: "A study in motion, light, and open sky.",
        query: "birds in flight",
        image: "/images/birds-in-flight.jpg",
    },
    {
        title: "Desert Bloom",
        description: "Small wonders in a wide-open landscape.",
        query: "desert wildflowers landscape",
        image: "/images/desert-bloom.jpg",
    },
    {
        title: "Blue Horizons",
        description: "Where the tide redraws the edge of the world.",
        query: "ocean waves and coastal waters",
        image: "/images/blue-horizons.jpg",
    },
    {
        title: "The Workshop",
        description: "Made slowly, with care and craft.",
        query: "traditional crafts at work",
        image: "/images/the-workshop.jpg",
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
            className="mt-2 mb-9 sm:mt-3"
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
                <div className="flex items-center gap-3">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500 sm:text-[11px]">
                        The Lucea field note
                    </p>
                    <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
                        {featuredStories.map((story, i) => (
                            <button
                                key={story.title}
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    i === activeIndex
                                        ? "w-5 bg-neutral-800 dark:bg-white"
                                        : "w-1.5 bg-neutral-300 hover:bg-neutral-500 dark:bg-neutral-700 dark:hover:bg-neutral-500"
                                }`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <span className="mr-2 font-mono text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400" aria-label={`Story ${activeIndex + 1} of ${featuredStories.length}`}>
                        {String(activeIndex + 1).padStart(2, "0")} <span className="text-neutral-300 dark:text-neutral-600">/</span> {String(featuredStories.length).padStart(2, "0")}
                    </span>
                    {!prefersReducedMotion && (
                        <button
                            type="button"
                            aria-label={isPlaying ? "Pause featured stories" : "Play featured stories"}
                            onClick={() => {
                                setIsPlaying(playing => !playing)
                                setIsInteracting(false)
                            }}
                            className="grid size-8 place-items-center rounded-full text-neutral-500 transition hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                        >
                            {isPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
                        </button>
                    )}
                    <button
                        type="button"
                        aria-label="Previous featured story"
                        onClick={() => move(-1)}
                        className="grid size-8 place-items-center rounded-full text-neutral-600 transition hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/[0.06] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next featured story"
                        onClick={() => move(1)}
                        className="grid size-8 place-items-center rounded-full text-neutral-600 transition hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/[0.06] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                    >
                        <ArrowRight size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2.5 md:flex-row md:gap-3">
                <AnimatePresence mode="wait" initial={false}>
                    <m.div
                        key={activeStory.title}
                        initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.98 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: "easeOut" }}
                        className="min-h-[300px] w-full sm:min-h-[350px] md:min-h-[390px] md:w-[55%]"
                    >
                        <Link
                            to={getSearchLink(activeStory.query)}
                            aria-label={`Explore ${activeStory.title}`}
                            className="group relative flex h-full min-h-[300px] w-full overflow-hidden rounded-[16px] border border-white/10 bg-neutral-950 text-white shadow-xl shadow-black/10 outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/20 sm:min-h-[350px] sm:rounded-[20px] md:min-h-[390px] md:rounded-[24px]"
                        >
                            <m.img
                                src={activeStory.image}
                                alt=""
                                initial={{ scale: prefersReducedMotion ? 1 : 1.08 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: "easeOut" }}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,13,16,.52),transparent_78%),linear-gradient(0deg,rgba(12,13,16,.78),transparent_72%)] transition-opacity duration-500 group-hover:opacity-90"
                            />
                            <span className="absolute left-5 top-5 rounded-full border border-white/35 bg-black/15 px-3 py-1.5 font-mono text-[11px] text-white/90 backdrop-blur-sm sm:left-7 sm:top-7">
                                {String(activeIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="relative mt-auto flex w-full items-end justify-between gap-4 p-5 sm:p-7 md:p-8">
                                <m.div
                                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: prefersReducedMotion ? 0 : 0.48, delay: prefersReducedMotion ? 0 : 0.08, ease: "easeOut" }}
                                    className="max-w-[18rem] sm:max-w-[24rem]"
                                >
                                    <span
                                        className="block text-[clamp(2.6rem,6.6vw,5.8rem)] leading-[0.9] tracking-[-0.045em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
                                        style={{ fontFamily: '"Playfair Display", serif' }}
                                    >
                                        {activeStory.title}
                                    </span>
                                    <span className="mt-3 block max-w-[34ch] text-sm leading-5 text-white/80 sm:text-base sm:leading-6">
                                        {activeStory.description}
                                    </span>
                                </m.div>
                                <m.span
                                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: prefersReducedMotion ? 0 : 0.48, delay: prefersReducedMotion ? 0 : 0.08, ease: "easeOut" }}
                                    className="mb-1 inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-neutral-900 transition-colors duration-200 group-hover:bg-[#f1e8da]"
                                >
                                    Explore
                                    <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </m.span>
                            </span>
                        </Link>
                    </m.div>
                </AnimatePresence>

                <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-hide sm:grid sm:min-h-[350px] sm:grid-cols-3 sm:grid-rows-2 md:min-h-[390px] flex-1">
                    {visibleStories.slice(1).map((story, index) => (
                            <div
                                key={story.title}
                                className="min-h-[92px] w-[140px] shrink-0 sm:w-auto sm:min-h-[112px]"
                            >
                                <Link
                                    to={getSearchLink(story.query)}
                                    aria-label={`Explore ${story.title}`}
                                    className="group relative block h-full min-h-[92px] overflow-hidden rounded-[10px] bg-neutral-200 outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/20 sm:min-h-[112px] sm:rounded-[14px] md:rounded-[16px]"
                                >
                                    <img
                                        src={story.image}
                                        alt=""
                                        loading={index < 3 ? "eager" : "lazy"}
                                        className="absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
                                    />
                                    <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent transition-colors group-hover:from-black/75" aria-hidden="true" />
                                    <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/20 px-2 py-1 font-mono text-[10px] text-white/90 backdrop-blur-sm sm:left-3.5 sm:top-3.5">
                                        {String((activeIndex + index + 1) % featuredStories.length + 1).padStart(2, "0")}
                                    </span>
                                    <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-1 sm:inset-x-3.5 sm:bottom-3.5">
                                        <span className="min-w-0">
                                            <span className="block truncate text-[11px] font-semibold text-white sm:text-[13px]">{story.title}</span>
                                        </span>
                                        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition group-hover:border-white group-hover:bg-white group-hover:text-neutral-900">
                                            <ArrowDownRight size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
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
