import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import Masonry, { ResponsiveMasonry, type MasonryProps } from "react-responsive-masonry"
import { ArrowLeft, ArrowUpRight, Images, ImagePlus, LayoutGrid, LockKeyhole, Trash2, Video, X } from "lucide-react"
import type { Moodboard } from "@/types/types"
import { useMoodboards } from "@/store/useMoodboards"
import { MASONRY_COLUMNS, MASONRY_GUTTER } from "@/lib/masonry"
import { useAuth } from "@/auth/useAuth"

type MoodboardMediaFilter = "all" | "photos" | "videos"

const MoodboardMasonry = ({ columnsCount = 1, itemStyle, ...props }: MasonryProps) => {
    const gutterWidth = Number.parseFloat(MASONRY_GUTTER)
    const columnWidth = `calc((100% - ${(columnsCount - 1) * gutterWidth}px) / ${columnsCount})`

    return (
        <Masonry
            {...props}
            columnsCount={columnsCount}
            itemStyle={{
                ...itemStyle,
                flex: `0 0 ${columnWidth}`,
                width: columnWidth,
            }}
        />
    )
}

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
    const media = moodboard.media.slice(0, 3)

    if (media.length === 0) {
        return (
            <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-neutral-100 to-[#f4efe9] text-neutral-500">
                <span className="flex items-center gap-2 text-sm"><ImagePlus size={17} aria-hidden="true" /> No saved items yet</span>
            </div>
        )
    }

    if (media.length === 1) {
        return <img src={media[0].thumbnail} alt="" className="block aspect-[4/3] w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]" loading="lazy" />
    }

    return (
        <div className="grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-1 overflow-hidden bg-[#fdfcfb]">
            {media.map((item, index) => (
                <div
                    key={item.key}
                    className={`relative min-h-0 min-w-0 overflow-hidden ${
                        index === 0
                            ? "col-span-2 row-span-2"
                            : media.length === 2
                                ? "col-span-1 row-span-2"
                                : "col-span-1 row-span-1"
                    }`}
                >
                    <img src={item.thumbnail} alt="" className="block h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]" loading="lazy" />
                    {index === media.length - 1 && moodboard.media.length > media.length && (
                        <span className="absolute inset-0 grid place-items-center bg-black/40 text-lg font-medium text-white">
                            +{moodboard.media.length - media.length}
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}

const MoodboardsPage = () => {
    const { moodboardId } = useParams()
    const navigate = useNavigate()
    const { user, isAuthLoading, openAuthDialog } = useAuth()
    const [title, setTitle] = useState("")
    const [createError, setCreateError] = useState("")
    const [moodboardToDelete, setMoodboardToDelete] = useState<Moodboard | null>(null)
    const [mediaFilter, setMediaFilter] = useState<MoodboardMediaFilter>("all")
    const moodboards = useMoodboards(state => state.moodboards)
    const accountId = useMoodboards(state => state.accountId)
    const isSyncing = useMoodboards(state => state.isSyncing)
    const syncError = useMoodboards(state => state.syncError)
    const retrySync = useMoodboards(state => state.retrySync)
    const createMoodboard = useMoodboards(state => state.createMoodboard)
    const removeMedia = useMoodboards(state => state.removeMedia)
    const deleteMoodboard = useMoodboards(state => state.deleteMoodboard)
    const moodboard = moodboards.find(item => item.id === moodboardId)
    const visibleMedia = moodboard?.media.filter(media =>
        mediaFilter === "all" || media.type === (mediaFilter === "photos" ? "photo" : "video")
    ) ?? []

    useEffect(() => {
        setTitle("")
        setCreateError("")
        setMediaFilter("all")
    }, [moodboardId])

    if (isAuthLoading || (user && (isSyncing || accountId !== user.id))) {
        return (
            <section className="grid min-h-screen place-items-center bg-[#fdfcfb] px-5 pb-10 pt-24 text-neutral-800 md:pt-12">
                <p className="inline-flex items-center gap-2 text-sm text-neutral-500" role="status">
                    <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
                    Loading your moodboards…
                </p>
            </section>
        )
    }

    if (!user) {
        return (
            <section className="grid min-h-screen place-items-center bg-[#fdfcfb] px-5 pb-10 pt-24 text-neutral-800 md:pt-12">
                <div className="w-full max-w-md rounded-3xl border border-black/[0.08] bg-white p-7 text-center shadow-sm">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-700">
                        <LockKeyhole size={20} aria-hidden="true" />
                    </div>
                    <h1 className="font-editorial mt-4 text-3xl text-neutral-700">Your moodboards</h1>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                        Sign in or create an account to save bookmarks and access your moodboards across devices.
                    </p>
                    <button
                        type="button"
                        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                        onClick={() => openAuthDialog("Sign in to revisit and organize everything you have saved.")}
                    >
                        Sign in or create an account
                    </button>
                </div>
            </section>
        )
    }

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
                <div className="relative mb-7 mt-5 flex flex-wrap items-end justify-center gap-3 border-b border-black/[0.08] pb-6 text-center sm:mb-9">
                    <div className="w-full">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Your collection</p>
                        <h1 className="font-editorial break-words pt-1 text-4xl font-normal text-neutral-700 sm:text-[48px]">{moodboard.title}</h1>
                        <p className="mt-2 text-base text-neutral-500 sm:text-lg" aria-live="polite">
                            {moodboard.media.length} saved {moodboard.media.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="relative inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm text-neutral-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        onClick={() => setMoodboardToDelete(moodboard)}
                    >
                        <Trash2 size={16} aria-hidden="true" /> Delete
                    </button>
                </div>

                {moodboard.media.length > 0 && (
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-neutral-500" aria-live="polite">
                            {visibleMedia.length} {mediaFilter === "all" ? "saved" : mediaFilter} {visibleMedia.length === 1 ? "item" : "items"}
                        </p>
                        <div
                            role="group"
                            aria-label="Filter moodboard items by media type"
                            className="inline-flex max-w-full items-center gap-1 rounded-full border border-black/[0.08] bg-white/80 p-1"
                        >
                            {([
                                { value: "all", label: "Everything", Icon: LayoutGrid },
                                { value: "photos", label: "Photos", Icon: Images },
                                { value: "videos", label: "Videos", Icon: Video },
                            ] as const).map(({ value, label, Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={mediaFilter === value}
                                    onClick={() => setMediaFilter(value)}
                                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:px-4 sm:text-sm ${
                                        mediaFilter === value
                                            ? "bg-neutral-900 text-white"
                                            : "text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900"
                                    }`}
                                >
                                    <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {moodboard.media.length > 0 && visibleMedia.length > 0 ? (
                    <ResponsiveMasonry columnsCountBreakPoints={MASONRY_COLUMNS}>
                        <MoodboardMasonry
                            gutter={MASONRY_GUTTER}
                            sequential
                            style={{ justifyContent: "flex-start" }}
                        >
                            {visibleMedia.map(media => (
                                <figure key={media.key} className="group relative w-full min-w-0 overflow-hidden rounded-3xl bg-neutral-200">
                                    <Link
                                        to={media.detailPath}
                                        className="relative block w-full min-w-0 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                    >
                                        <img
                                            src={media.thumbnail}
                                            alt={media.alt}
                                            loading="lazy"
                                            className="block h-auto w-full"
                                        />
                                        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
                                        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-3.5 pb-3.5 text-xs text-white sm:px-4 sm:pb-4">
                                            <span className="min-w-0 truncate font-medium">{media.creator}</span>
                                            <span className="shrink-0 capitalize text-white/75">{media.type}</span>
                                        </span>
                                    </Link>
                                    <button
                                        type="button"
                                        aria-label={`Remove ${media.type} by ${media.creator} from ${moodboard.title}`}
                                        title="Remove from moodboard"
                                        className="media-action absolute right-3 top-3 rounded-full border border-white/80 bg-black/25 p-2.5 text-white shadow-sm backdrop-blur-sm hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                        onClick={() => removeMedia(moodboard.id, media.key)}
                                    >
                                        <X size={17} aria-hidden="true" />
                                    </button>
                                </figure>
                            ))}
                        </MoodboardMasonry>
                    </ResponsiveMasonry>
                ) : moodboard.media.length === 0 ? (
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
                ) : (
                    <div role="status" className="rounded-3xl border border-dashed border-black/15 bg-white/60 px-5 py-10 text-center text-sm text-neutral-500">
                        No {mediaFilter} saved to this moodboard yet.
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
                <header className="pt-1 text-center">
                    <h1 className="font-editorial text-4xl font-normal text-neutral-700 sm:text-[48px]">Moodboards</h1>
                    <p className="mt-1 text-xl text-neutral-800">Keep the things that move you.</p>
                    <p className="mt-2 text-sm text-neutral-500">Collect photos and videos for ideas you want to revisit.</p>
                </header>

                {accountId && syncError && (
                    <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                        <span>Moodboards couldn’t save: {syncError}</span>
                        <button
                            type="button"
                            disabled={isSyncing}
                            aria-busy={isSyncing}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-800 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-70"
                            onClick={() => void retrySync()}
                        >
                            {isSyncing && <span aria-hidden="true" className="size-3 animate-spin rounded-full border-2 border-red-300 border-t-red-800" />}
                            {isSyncing ? "Retrying…" : "Retry save"}
                        </button>
                    </div>
                )}

                <form onSubmit={onCreateMoodboard} className="mx-auto mt-7 max-w-xl border-y border-black/[0.08] py-4 sm:flex sm:items-end sm:gap-3 sm:py-5">
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
                        className={`group mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:mt-0 sm:w-auto ${
                            title.trim()
                                ? "bg-neutral-900 text-white hover:-translate-y-0.5 hover:bg-neutral-700 hover:shadow-md active:translate-y-0"
                                : "cursor-not-allowed border border-[#e8dfd3] bg-[#f3eee7] text-[#927d67]"
                        }`}
                    >
                        <ImagePlus size={17} className="transition-transform duration-200 group-hover:rotate-[-6deg] group-hover:scale-110" aria-hidden="true" /> Create board
                    </button>
                </form>

                {moodboards.length > 0 ? (
                    <div className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold text-neutral-700">Saved boards <span className="ml-1 font-normal text-neutral-500">({moodboards.length})</span></h2>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {moodboards.map(board => (
                            <article key={board.id} className="group relative overflow-hidden rounded-3xl bg-neutral-200 transition-shadow duration-300 hover:shadow-lg">
                                <Link
                                    to={`/moodboards/${board.id}`}
                                    aria-label={`${board.title}, ${board.media.length} saved ${board.media.length === 1 ? "item" : "items"}`}
                                    className="relative block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                >
                                    <MoodboardPreview moodboard={board} />
                                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
                                        <span className="min-w-0">
                                            <span className="block truncate text-2xl text-white">{board.title}</span>
                                            <span className="mt-1 block text-sm text-white/80" aria-hidden="true">
                                                {board.media.length} {board.media.length === 1 ? "item" : "items"}
                                            </span>
                                        </span>
                                        <ArrowUpRight size={18} className="mb-1 shrink-0 text-white/80" aria-hidden="true" />
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    aria-label={`Delete ${board.title}`}
                                    title="Delete moodboard"
                                    className="media-action absolute right-3 top-3 rounded-full border border-white/80 bg-black/25 p-2.5 text-white shadow-sm backdrop-blur-sm hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
