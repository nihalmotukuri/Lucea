import { useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Trash2, X } from "lucide-react"
import { useMoodboards } from "@/store/useMoodboards"

const MoodboardsPage = () => {
    const { moodboardId } = useParams()
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const moodboards = useMoodboards(state => state.moodboards)
    const createMoodboard = useMoodboards(state => state.createMoodboard)
    const removeMedia = useMoodboards(state => state.removeMedia)
    const deleteMoodboard = useMoodboards(state => state.deleteMoodboard)
    const moodboard = moodboards.find(item => item.id === moodboardId)

    const onCreateMoodboard = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedTitle = title.trim()
        if (!trimmedTitle) return

        createMoodboard(trimmedTitle)
        setTitle("")
    }

    if (moodboardId && !moodboard) {
        return (
            <section className="min-h-screen bg-[#fdfcfb] px-5 pb-10 pt-24 text-neutral-800 md:pt-12">
                <h1 className="text-3xl font-semibold">Moodboard not found</h1>
                <Link className="mt-4 inline-block underline" to="/moodboards">Back to moodboards</Link>
            </section>
        )
    }

    if (moodboard) {
        return (
            <section className="min-h-screen bg-[#fdfcfb] px-5 pb-10 pt-24 text-neutral-800 md:px-8 md:pt-12">
                <Link to="/moodboards" className="text-sm text-neutral-600 hover:text-neutral-900">← All moodboards</Link>
                <div className="mb-7 mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-semibold sm:text-4xl">{moodboard.title}</h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            {moodboard.media.length} {moodboard.media.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="rounded-full border border-black/15 p-2 text-neutral-600 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        aria-label={`Delete ${moodboard.title}`}
                        title="Delete moodboard"
                        onClick={() => {
                            if (window.confirm(`Delete "${moodboard.title}" and its saved items?`)) {
                                deleteMoodboard(moodboard.id)
                                navigate("/moodboards")
                            }
                        }}
                    >
                        <Trash2 size={18} aria-hidden="true" />
                    </button>
                </div>

                {moodboard.media.length > 0 ? (
                    <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                        <Masonry>
                            {moodboard.media.map(media => (
                                <div key={media.key} className="relative m-1 overflow-hidden rounded-2xl">
                                    <Link
                                        to={media.detailPath}
                                        className="block overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                    >
                                        <img
                                            src={media.thumbnail}
                                            alt={media.alt}
                                            loading="lazy"
                                            className="block h-auto w-full"
                                        />
                                    </Link>
                                    <button
                                        type="button"
                                        aria-label={`Remove ${media.type} by ${media.creator} from ${moodboard.title}`}
                                        title="Remove from moodboard"
                                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-neutral-800 shadow hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                                        onClick={() => removeMedia(moodboard.id, media.key)}
                                    >
                                        <X size={17} aria-hidden="true" />
                                    </button>
                                </div>
                            ))}
                        </Masonry>
                    </ResponsiveMasonry>
                ) : (
                    <p className="rounded-2xl border border-dashed border-black/20 px-5 py-10 text-center text-neutral-500">
                        This moodboard is empty. Save photos or videos while exploring to collect them here.
                    </p>
                )}
            </section>
        )
    }

    return (
        <section className="min-h-screen bg-[#fdfcfb] px-5 pb-10 pt-24 text-neutral-800 md:px-8 md:pt-12">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-semibold sm:text-4xl">Your moodboards</h1>
                <p className="mt-2 text-neutral-600">Collect photos and videos for your next idea.</p>

                <form onSubmit={onCreateMoodboard} className="mt-6 flex max-w-lg gap-2">
                    <input
                        aria-label="New moodboard name"
                        className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                        maxLength={60}
                        placeholder="Name a moodboard"
                        value={title}
                        onChange={event => setTitle(event.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="rounded-xl bg-neutral-900 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Create
                    </button>
                </form>

                {moodboards.length > 0 ? (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {moodboards.map(board => (
                            <article key={board.id} className="relative overflow-hidden rounded-2xl border border-black/10 bg-white">
                                <Link
                                    to={`/moodboards/${board.id}`}
                                    className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                >
                                    {board.media.length > 0 ? (
                                        board.media.length === 1 ? (
                                            <img
                                                src={board.media[0].thumbnail}
                                                alt=""
                                                className="block aspect-[16/9] w-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="grid aspect-[16/9] grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden bg-neutral-100">
                                                {board.media.slice(0, 4).map(media => (
                                                    <img key={media.key} src={media.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                                                ))}
                                            </div>
                                        )
                                    ) : (
                                        <div className="grid aspect-[16/9] place-items-center bg-neutral-100 text-neutral-400">
                                            No saved items yet
                                        </div>
                                    )}
                                    <div className="p-4 pr-14">
                                        <h2 className="truncate text-lg font-medium">{board.title}</h2>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            {board.media.length} {board.media.length === 1 ? "item" : "items"}
                                        </p>
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    aria-label={`Delete ${board.title}`}
                                    title="Delete moodboard"
                                    className="absolute bottom-4 right-4 rounded-full p-2 text-neutral-500 hover:bg-black/5 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                    onClick={() => {
                                        if (window.confirm(`Delete "${board.title}" and its saved items?`)) {
                                            deleteMoodboard(board.id)
                                        }
                                    }}
                                >
                                    <Trash2 size={17} aria-hidden="true" />
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="mt-8 rounded-2xl border border-dashed border-black/20 px-5 py-10 text-center text-neutral-500">
                        No moodboards yet. Create one here or save media while browsing.
                    </p>
                )}
            </div>
        </section>
    )
}

export default MoodboardsPage
