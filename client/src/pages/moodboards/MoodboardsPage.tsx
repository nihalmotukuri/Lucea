import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { ArrowLeft, ArrowUpRight, ImagePlus, Trash2, X } from "lucide-react"
import type { Moodboard } from "@/types/types"
import { useMoodboards } from "@/store/useMoodboards"

interface DeleteMoodboardDialogProps {
    moodboard: Moodboard | null
    onCancel: () => void
    onConfirm: () => void
}

const DeleteMoodboardDialog = ({ moodboard, onCancel, onConfirm }: DeleteMoodboardDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (moodboard && !dialog.open) dialog.showModal()
        if (!moodboard && dialog.open) dialog.close()
    }, [moodboard])

    if (!moodboard) return null

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="delete-moodboard-title"
            aria-describedby="delete-moodboard-description"
            className="fixed inset-0 m-auto w-[min(92vw,26rem)] rounded-3xl border border-black/10 bg-[#fdfcfb] p-0 text-neutral-800 shadow-2xl backdrop:bg-neutral-950/45 backdrop:backdrop-blur-[2px]"
            onCancel={event => {
                event.preventDefault()
                onCancel()
            }}
            onKeyDown={event => {
                if (event.key === "Escape") {
                    event.preventDefault()
                    onCancel()
                }
            }}
            onClose={onCancel}
            onClick={event => {
                if (event.target === dialogRef.current) onCancel()
            }}
        >
            <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-700">
                        <Trash2 size={19} aria-hidden="true" />
                    </div>
                    <button
                        type="button"
                        aria-label="Close dialog"
                        className="rounded-full p-2 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        onClick={onCancel}
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
                <h2 id="delete-moodboard-title" className="text-xl font-semibold">Delete this moodboard?</h2>
                <p id="delete-moodboard-description" className="mt-2 text-sm leading-6 text-neutral-600">
                    <span className="font-medium text-neutral-800">{moodboard.title}</span> and its {moodboard.media.length} saved {moodboard.media.length === 1 ? "item" : "items"} will be permanently removed from this browser.
                </p>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        className="min-h-11 rounded-xl border border-black/10 px-4 text-sm font-medium transition hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                        onClick={onCancel}
                    >
                        Keep moodboard
                    </button>
                    <button
                        type="button"
                        className="min-h-11 rounded-xl bg-red-700 px-4 text-sm font-medium text-white transition hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                        onClick={onConfirm}
                    >
                        Delete moodboard
                    </button>
                </div>
            </div>
        </dialog>
    )
}

const MoodboardPreview = ({ moodboard }: { moodboard: Moodboard }) => {
    const media = moodboard.media.slice(0, 4)

    if (media.length === 0) {
        return (
            <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-neutral-100 to-[#f4efe9] text-neutral-500">
                <span className="flex items-center gap-2 text-sm"><ImagePlus size={17} aria-hidden="true" /> No saved items yet</span>
            </div>
        )
    }

    if (media.length === 1) {
        return <img src={media[0].thumbnail} alt="" className="block aspect-[16/9] w-full object-cover" loading="lazy" />
    }

    return (
        <div className={`grid aspect-[16/9] grid-cols-2 gap-0.5 overflow-hidden bg-neutral-100 ${media.length === 2 ? "grid-rows-1" : "grid-rows-2"}`}>
            {media.map((item, index) => (
                <img
                    key={item.key}
                    src={item.thumbnail}
                    alt=""
                    className={`h-full w-full object-cover ${media.length === 3 && index === 0 ? "row-span-2" : ""}`}
                    loading="lazy"
                />
            ))}
        </div>
    )
}

const MoodboardsPage = () => {
    const { moodboardId } = useParams()
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [createError, setCreateError] = useState("")
    const [moodboardToDelete, setMoodboardToDelete] = useState<Moodboard | null>(null)
    const moodboards = useMoodboards(state => state.moodboards)
    const createMoodboard = useMoodboards(state => state.createMoodboard)
    const removeMedia = useMoodboards(state => state.removeMedia)
    const deleteMoodboard = useMoodboards(state => state.deleteMoodboard)
    const moodboard = moodboards.find(item => item.id === moodboardId)

    useEffect(() => {
        setTitle("")
        setCreateError("")
    }, [moodboardId])

    const onCreateMoodboard = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedTitle = title.trim()
        if (!trimmedTitle) return

        if (moodboards.some(board => board.title.toLocaleLowerCase() === trimmedTitle.toLocaleLowerCase())) {
            setCreateError("A moodboard with this name already exists.")
            return
        }

        createMoodboard(trimmedTitle)
        setTitle("")
        setCreateError("")
    }

    const confirmDelete = () => {
        if (!moodboardToDelete) return
        deleteMoodboard(moodboardToDelete.id)
        const isCurrentMoodboard = moodboardToDelete.id === moodboardId
        setMoodboardToDelete(null)
        if (isCurrentMoodboard) navigate("/moodboards")
    }

    if (moodboardId && !moodboard) {
        return (
            <section className="min-h-screen bg-[#fdfcfb] px-5 pb-10 pt-24 text-neutral-800 md:pt-12">
                <div className="mx-auto mt-10 max-w-md rounded-3xl border border-black/[0.08] bg-white p-7 text-center shadow-sm">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-600">
                        <ImagePlus size={20} aria-hidden="true" />
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold">Moodboard not found</h1>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">It may have been deleted or is not available in this browser.</p>
                    <Link className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700" to="/moodboards">
                        <ArrowLeft size={16} aria-hidden="true" /> Back to moodboards
                    </Link>
                </div>
            </section>
        )
    }

    if (moodboard) {
        return (
            <section className="min-h-screen bg-[#fdfcfb] px-4 pb-10 pt-24 text-neutral-800 sm:px-5 md:px-8 md:pt-12">
                <div className="mx-auto max-w-[1500px]">
                <Link to="/moodboards" className="inline-flex min-h-9 items-center gap-2 rounded-lg pr-2 text-sm text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700">
                    <ArrowLeft size={16} aria-hidden="true" /> All moodboards
                </Link>
                <div className="mb-6 mt-3 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
                    <div>
                        <h1 className="break-words text-3xl font-semibold sm:text-4xl" style={{ fontFamily: '"PT Serif", serif' }}>{moodboard.title}</h1>
                        <p className="mt-2 text-sm text-neutral-500" aria-live="polite">
                            {moodboard.media.length} saved {moodboard.media.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 px-3 text-sm font-medium text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        onClick={() => setMoodboardToDelete(moodboard)}
                    >
                        <Trash2 size={16} aria-hidden="true" /> Delete
                    </button>
                </div>

                {moodboard.media.length > 0 ? (
                    <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                        <Masonry gutter="12px">
                            {moodboard.media.map(media => (
                                <figure key={media.key} className="group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm transition hover:shadow-md">
                                    <Link
                                        to={media.detailPath}
                                        className="block overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                    >
                                        <img
                                            src={media.thumbnail}
                                            alt={media.alt}
                                            loading="lazy"
                                            className="fade-in block h-auto w-full transition duration-300 group-hover:scale-[1.015]"
                                        />
                                    </Link>
                                    <button
                                        type="button"
                                        aria-label={`Remove ${media.type} by ${media.creator} from ${moodboard.title}`}
                                        title="Remove from moodboard"
                                        className="media-action absolute right-3 top-3 rounded-full bg-white/95 p-2.5 text-neutral-800 shadow-md ring-1 ring-black/5 transition hover:scale-105 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                                        onClick={() => removeMedia(moodboard.id, media.key)}
                                    >
                                        <X size={17} aria-hidden="true" />
                                    </button>
                                    <figcaption className="flex items-center justify-between gap-3 border-t border-black/[0.05] px-3 py-2.5 text-xs">
                                        <span className="truncate font-medium text-neutral-700">{media.creator}</span>
                                        <span className="shrink-0 capitalize text-neutral-400">{media.type}</span>
                                    </figcaption>
                                </figure>
                            ))}
                        </Masonry>
                    </ResponsiveMasonry>
                ) : (
                    <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 px-5 py-10 text-center sm:py-14">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-600">
                            <ImagePlus size={20} aria-hidden="true" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">Start collecting inspiration</h2>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                            Save photos and videos from your feed to build this moodboard.
                        </p>
                        <Link to="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700">
                            Explore media <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                )}
                </div>
                <DeleteMoodboardDialog
                    moodboard={moodboardToDelete}
                    onCancel={() => setMoodboardToDelete(null)}
                    onConfirm={confirmDelete}
                />
            </section>
        )
    }

    return (
        <section className="min-h-screen bg-[#fdfcfb] px-5 pb-10 pt-24 text-neutral-800 md:px-8 md:pt-12">
            <div className="mx-auto max-w-6xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Your library</p>
                <h1 className="mt-2 text-3xl font-semibold sm:text-4xl" style={{ fontFamily: '"PT Serif", serif' }}>Moodboards</h1>
                <p className="mt-2 text-neutral-600">Collect photos and videos for ideas you want to revisit.</p>
                <p className="mt-1 text-xs text-neutral-500">Moodboards are saved in this browser.</p>

                <form onSubmit={onCreateMoodboard} className="mt-6 max-w-xl rounded-2xl border border-black/[0.08] bg-white p-3 shadow-sm sm:flex sm:items-end sm:gap-3 sm:p-4">
                    <div className="min-w-0 flex-1">
                        <label htmlFor="moodboard-name" className="mb-2 block text-sm font-medium text-neutral-700">Create a moodboard</label>
                        <input
                            id="moodboard-name"
                            aria-describedby={createError ? "moodboard-name-hint moodboard-name-error" : "moodboard-name-hint"}
                            aria-invalid={Boolean(createError)}
                            className="min-h-11 w-full rounded-xl border border-black/10 bg-[#fdfcfb] px-3 text-sm outline-none transition placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-500 aria-[invalid=true]:border-red-500"
                            maxLength={60}
                            placeholder="e.g. Warm autumn tones"
                            value={title}
                            onChange={event => {
                                setTitle(event.target.value)
                                if (createError) setCreateError("")
                            }}
                        />
                        <p id="moodboard-name-hint" className="mt-1.5 text-xs text-neutral-500">Choose a name you’ll recognize later · 60 characters max</p>
                        {createError && <p id="moodboard-name-error" className="mt-1 text-xs text-red-700" role="alert">{createError}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:mt-0 sm:w-auto"
                    >
                        <ImagePlus size={17} aria-hidden="true" /> Create board
                    </button>
                </form>

                {moodboards.length > 0 ? (
                    <div className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold text-neutral-700">Saved boards <span className="ml-1 font-normal text-neutral-500">({moodboards.length})</span></h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {moodboards.map(board => (
                            <article key={board.id} className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                <Link
                                    to={`/moodboards/${board.id}`}
                                    aria-label={`${board.title}, ${board.media.length} saved ${board.media.length === 1 ? "item" : "items"}`}
                                    className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                >
                                    <MoodboardPreview moodboard={board} />
                                    <div className="flex items-center justify-between gap-3 p-4 pr-14">
                                        <div className="min-w-0">
                                        <h2 className="truncate text-lg font-medium">{board.title}</h2>
                                        <p className="mt-1 text-sm text-neutral-500" aria-hidden="true">
                                            {board.media.length} {board.media.length === 1 ? "item" : "items"}
                                        </p>
                                        </div>
                                        <ArrowUpRight size={17} className="shrink-0 text-neutral-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-700" aria-hidden="true" />
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    aria-label={`Delete ${board.title}`}
                                    title="Delete moodboard"
                                    className="media-action absolute bottom-3 right-10 rounded-full p-2 text-neutral-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                    onClick={() => setMoodboardToDelete(board)}
                                >
                                    <Trash2 size={17} aria-hidden="true" />
                                </button>
                            </article>
                        ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-white/50 px-5 py-10 text-center sm:py-14">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-600">
                            <ImagePlus size={20} aria-hidden="true" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">Your inspiration starts here</h2>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                            Create a moodboard above, then save photos and videos as you browse.
                        </p>
                        <Link to="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700">
                            Explore media <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                )}
            </div>
            <DeleteMoodboardDialog
                moodboard={moodboardToDelete}
                onCancel={() => setMoodboardToDelete(null)}
                onConfirm={confirmDelete}
            />
        </section>
    )
}

export default MoodboardsPage
