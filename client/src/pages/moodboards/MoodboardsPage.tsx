import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import Masonry, { ResponsiveMasonry, type MasonryProps } from "react-responsive-masonry"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ArrowUpRight, Copy, Globe2, Images, ImagePlus, LayoutGrid, LockKeyhole, Trash2, Video, X } from "lucide-react"
import type { Moodboard } from "@/types/types"
import { useMoodboards } from "@/store/useMoodboards"
import { MASONRY_COLUMNS, MASONRY_GUTTER } from "@/lib/masonry"
import { useAuth } from "@/auth/useAuth"
import { getOwnProfile } from "@/api/moodboards"
import LoadingIndicator from "@/components/features/LoadingIndicator"
import { fullScreenLoadingClass, useMinimumLoading } from "@/lib/loadingIndicator"
import TopHeader from "@/components/layout/TopHeader"

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
            className="fixed inset-0 m-auto w-[min(92vw,26rem)] rounded-3xl border border-black/10 bg-[#fdfcfb] p-0 text-neutral-800 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm dark:border-white/[0.09] dark:bg-[#181615] dark:text-neutral-100"
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
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                        <Trash2 size={19} aria-hidden="true" />
                    </div>
                    <button
                        type="button"
                        aria-label="Close dialog"
                        className="rounded-full p-2 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                        onClick={onCancel}
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
                <h2 id="delete-moodboard-title" className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Delete this moodboard?</h2>
                <p id="delete-moodboard-description" className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{moodboard.title}</span> and its {moodboard.media.length} saved {moodboard.media.length === 1 ? "item" : "items"} will be permanently removed from your account. Any public link will stop working.
                </p>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        className="min-h-11 rounded-xl border border-black/10 px-4 text-sm font-medium transition hover:bg-black/[0.04] dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                        onClick={onCancel}
                    >
                        Keep moodboard
                    </button>
                    <button
                        type="button"
                        className="min-h-11 rounded-xl bg-red-700 px-4 text-sm font-medium text-white transition hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
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
            <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-neutral-100 to-[#f4efe9] text-neutral-500 dark:from-neutral-900 dark:to-[#1a1917] dark:text-neutral-400">
                <span className="flex items-center gap-2 text-sm"><ImagePlus size={17} aria-hidden="true" /> No saved items yet</span>
            </div>
        )
    }

    if (media.length === 1) {
        return <img src={media[0].thumbnail} alt="" className="block aspect-[4/3] w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]" loading="lazy" />
    }

    return (
        <div className="grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-1 overflow-hidden bg-[#fdfcfb] dark:bg-[#121110]">
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
    const { user, accessToken, isAuthLoading, openAuthDialog } = useAuth()
    const [title, setTitle] = useState("")
    const [createError, setCreateError] = useState("")
    const [moodboardToDelete, setMoodboardToDelete] = useState<Moodboard | null>(null)
    const [mediaFilter, setMediaFilter] = useState<MoodboardMediaFilter>("all")
    const [shareMessage, setShareMessage] = useState("")
    const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)
    const moodboards = useMoodboards(state => state.moodboards)
    const accountId = useMoodboards(state => state.accountId)
    const isSyncing = useMoodboards(state => state.isSyncing)
    const syncError = useMoodboards(state => state.syncError)
    const retrySync = useMoodboards(state => state.retrySync)
    const setMoodboardVisibility = useMoodboards(state => state.setMoodboardVisibility)
    const createMoodboard = useMoodboards(state => state.createMoodboard)
    const removeMedia = useMoodboards(state => state.removeMedia)
    const deleteMoodboard = useMoodboards(state => state.deleteMoodboard)
    const moodboard = moodboards.find(item => item.id === moodboardId)
    const profileQuery = useQuery({
        queryKey: ["own-profile", user?.id],
        queryFn: () => getOwnProfile(accessToken!),
        enabled: Boolean(user && accessToken),
    })
    const visibleMedia = moodboard?.media.filter(media =>
        mediaFilter === "all" || media.type === (mediaFilter === "photos" ? "photo" : "video")
    ) ?? []
    const showLoading = useMinimumLoading(Boolean(
        isAuthLoading || (user && (isSyncing || accountId !== user.id)),
    ))

    useEffect(() => {
        setTitle("")
        setCreateError("")
        setMediaFilter("all")
        setShareMessage("")
    }, [moodboardId])

    if (showLoading) {
        return <LoadingIndicator label="Loading your moodboards" className={fullScreenLoadingClass} />
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#fdfcfb] pt-[120px] dark:bg-[#121110]">
                <TopHeader />
                <section className="grid place-items-center px-5 pb-10 text-neutral-800 dark:text-neutral-100">
                    <div className="w-full max-w-md rounded-3xl border border-black/[0.08] bg-white p-7 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#1a1917]">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-700 dark:bg-[#282522] dark:text-neutral-200">
                            <LockKeyhole size={20} aria-hidden="true" />
                        </div>
                        <h1 className="font-editorial mt-4 text-3xl text-neutral-700 dark:text-neutral-100">Your moodboards</h1>
                        <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            Sign in or create an account to save bookmarks and access your moodboards across devices.
                        </p>
                        <button
                            type="button"
                            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                            onClick={() => openAuthDialog("Sign in to revisit and organize everything you have saved.")}
                        >
                            Sign in or create an account
                        </button>
                    </div>
                </section>
            </div>
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

    const toggleVisibility = async () => {
        if (!moodboard) return
        setIsUpdatingVisibility(true)
        setShareMessage("")
        try {
            await setMoodboardVisibility(moodboard.id, !moodboard.isPublic)
        } catch (error) {
            setShareMessage(error instanceof Error ? error.message : "Unable to update moodboard visibility.")
        } finally {
            setIsUpdatingVisibility(false)
        }
    }

    const copyPublicLink = async () => {
        if (!moodboard || !profileQuery.data?.handle) return
        const publicPath = `/profiles/${encodeURIComponent(profileQuery.data.handle)}/boards/${encodeURIComponent(moodboard.id)}`
        try {
            if (!navigator.clipboard) throw new Error("Clipboard access is unavailable in this browser.")
            await navigator.clipboard.writeText(new URL(publicPath, window.location.origin).toString())
            setShareMessage("Public link copied.")
        } catch (error) {
            setShareMessage(error instanceof Error ? error.message : "Could not copy the public link.")
        }
    }

    if (moodboardId && !moodboard) {
        return (
            <div className="min-h-screen bg-[#fdfcfb] pt-[120px] dark:bg-[#121110]">
                <TopHeader />
                <section className="px-5 pb-10 text-neutral-800 dark:text-neutral-100">
                    <div className="mx-auto mt-6 max-w-md rounded-3xl border border-black/[0.08] bg-white p-7 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#1a1917]">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            <ImagePlus size={20} aria-hidden="true" />
                        </div>
                        <h1 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-white">Moodboard not found</h1>
                        <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">It may have been deleted or is not available in this browser.</p>
                        <Link className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200" to="/moodboards">
                            <ArrowLeft size={16} aria-hidden="true" /> Back to moodboards
                        </Link>
                    </div>
                </section>
            </div>
        )
    }

    if (moodboard) {
        return (
            <div className="min-h-screen bg-[#fdfcfb] pt-[120px] dark:bg-[#121110]">
                <TopHeader />
                <section className="px-4 pb-10 text-neutral-800 dark:text-neutral-100 sm:px-5 md:px-8">
                    <div className="mx-auto max-w-[1500px]">
                    <Link to="/moodboards" className="inline-flex min-h-9 items-center gap-2 rounded-lg pr-2 text-sm text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-400 dark:hover:text-white">
                        <ArrowLeft size={16} aria-hidden="true" /> All moodboards
                    </Link>
                <div className="relative mb-7 mt-5 flex flex-wrap items-end justify-center gap-3 border-b border-black/[0.08] pb-6 text-center dark:border-white/[0.08] sm:mb-9">
                    <div className="w-full">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">Your collection</p>
                        <h1 className="font-editorial break-words pt-1 text-4xl font-normal text-neutral-700 dark:text-neutral-100 sm:text-[48px]">{moodboard.title}</h1>
                        <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400 sm:text-lg" aria-live="polite">
                            {moodboard.media.length} saved {moodboard.media.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="relative inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm text-neutral-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800 dark:text-neutral-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        onClick={() => setMoodboardToDelete(moodboard)}
                    >
                        <Trash2 size={16} aria-hidden="true" /> Delete
                    </button>
                </div>

                <section aria-label="Moodboard sharing" className="mb-6 rounded-2xl border border-black/[0.08] bg-white p-4 dark:border-white/[0.08] dark:bg-[#1a1917] sm:flex sm:items-center sm:justify-between sm:gap-5">
                    <div className="flex items-start gap-3">
                        {moodboard.isPublic
                            ? <Globe2 size={18} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                            : <LockKeyhole size={18} className="mt-0.5 shrink-0 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                        }
                        <div>
                            <h2 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{moodboard.isPublic ? "Public moodboard" : "Private moodboard"}</h2>
                            <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                                {moodboard.isPublic
                                    ? "Anyone with the link can view this board and it may appear in related search results."
                                    : "Only you can see this board. Publishing makes it visible on your profile and in related searches."
                                }
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">
                        {profileQuery.data?.handle ? (
                            <>
                                <button
                                    type="button"
                                    disabled={isUpdatingVisibility || profileQuery.isPending}
                                    onClick={() => void toggleVisibility()}
                                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-xs font-medium text-neutral-700 hover:bg-black/[0.04] disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
                                >
                                    {moodboard.isPublic ? <LockKeyhole size={14} aria-hidden="true" /> : <Globe2 size={14} aria-hidden="true" />}
                                    {isUpdatingVisibility ? "Updating…" : moodboard.isPublic ? "Make private" : "Publish board"}
                                </button>
                                {moodboard.isPublic && (
                                    <button
                                        type="button"
                                        onClick={() => void copyPublicLink()}
                                        className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-neutral-900 px-3 text-xs font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                                    >
                                        <Copy size={14} aria-hidden="true" /> Copy link
                                    </button>
                                )}
                            </>
                        ) : (
                            <Link
                                to="/profile"
                                className="inline-flex min-h-9 items-center rounded-lg border border-black/10 px-3 text-xs font-medium text-neutral-700 hover:bg-black/[0.04] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
                            >
                                {profileQuery.isError ? "Profile unavailable — retry" : "Choose a profile handle"}
                            </Link>
                        )}
                    </div>
                    {shareMessage && <p className="mt-3 basis-full text-xs text-neutral-600 dark:text-neutral-400" role="status">{shareMessage}</p>}
                </section>

                {accountId && syncError && (
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400" role="alert">
                        <span>Moodboard changes may not be saved: {syncError}</span>
                        <button
                            type="button"
                            disabled={isSyncing}
                            onClick={() => void retrySync()}
                            className="min-h-9 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium disabled:opacity-60 dark:border-red-900/40 dark:bg-[#1f1d1a] dark:text-red-300"
                        >
                            {isSyncing ? "Retrying…" : "Retry save"}
                        </button>
                    </div>
                )}

                {moodboard.media.length > 0 && (
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400" aria-live="polite">
                            {visibleMedia.length} {mediaFilter === "all" ? "saved" : mediaFilter} {visibleMedia.length === 1 ? "item" : "items"}
                        </p>
                        <div
                            role="group"
                            aria-label="Filter moodboard items by media type"
                            className="inline-flex max-w-full items-center gap-1 rounded-full border border-black/[0.08] bg-white/80 p-1 dark:border-white/[0.08] dark:bg-[#1a1917]/80"
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
                                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                            : "text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
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
                                <figure key={media.key} className="group relative w-full min-w-0 overflow-hidden rounded-3xl bg-neutral-200 dark:bg-neutral-800">
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
                    <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 px-5 py-10 text-center dark:border-white/15 dark:bg-[#1a1917]/60 sm:py-14">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-600 dark:bg-[#25221e] dark:text-neutral-300">
                            <ImagePlus size={20} aria-hidden="true" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">Start collecting inspiration</h2>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            Save photos and videos from your feed to build this moodboard.
                        </p>
                        <Link to="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                            Explore media <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                ) : (
                    <div role="status" className="rounded-3xl border border-dashed border-black/15 bg-white/60 px-5 py-10 text-center text-sm text-neutral-500 dark:border-white/15 dark:bg-[#1a1917]/60 dark:text-neutral-400">
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
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fdfcfb] pt-[120px] dark:bg-[#121110]">
            <TopHeader />
            <section className="px-5 pb-10 text-neutral-800 dark:text-neutral-100 md:px-8">
            <div className="mx-auto max-w-6xl">
                <header className="pt-1 text-center">
                    <h1 className="font-editorial text-4xl font-normal text-neutral-700 dark:text-neutral-100 sm:text-[48px]">Moodboards</h1>
                    <p className="mt-1 text-xl text-neutral-800 dark:text-neutral-200">Keep the things that move you.</p>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Collect photos and videos for ideas you want to revisit.</p>
                </header>

                {accountId && syncError && (
                    <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400" role="alert">
                        <span>Moodboards couldn’t save: {syncError}</span>
                        <button
                            type="button"
                            disabled={isSyncing}
                            aria-busy={isSyncing}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-800 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-70 dark:border-red-900/40 dark:bg-[#1f1d1a] dark:text-red-300"
                            onClick={() => void retrySync()}
                        >
                            {isSyncing && <span aria-hidden="true" className="size-3 animate-spin rounded-full border-2 border-red-300 border-t-red-800" />}
                            {isSyncing ? "Retrying…" : "Retry save"}
                        </button>
                    </div>
                )}

                <form onSubmit={onCreateMoodboard} className="mx-auto mt-7 max-w-xl border-y border-black/[0.08] py-4 dark:border-white/[0.08] sm:flex sm:items-end sm:gap-3 sm:py-5">
                    <div className="min-w-0 flex-1">
                        <label htmlFor="moodboard-name" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Create a moodboard</label>
                        <input
                            id="moodboard-name"
                            aria-describedby={createError ? "moodboard-name-hint moodboard-name-error" : "moodboard-name-hint"}
                            aria-invalid={Boolean(createError)}
                            className="min-h-11 w-full rounded-xl border border-black/10 bg-[#fdfcfb] px-3 text-sm outline-none transition placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-500 aria-[invalid=true]:border-red-500 dark:border-white/10 dark:bg-[#1a1917] dark:text-neutral-100 dark:placeholder:text-neutral-500"
                            maxLength={60}
                            placeholder="e.g. Warm autumn tones"
                            value={title}
                            onChange={event => {
                                setTitle(event.target.value)
                                if (createError) setCreateError("")
                            }}
                        />
                        <p id="moodboard-name-hint" className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">Choose a name you’ll recognize later · 60 characters max</p>
                        {createError && <p id="moodboard-name-error" className="mt-1 text-xs text-red-700 dark:text-red-400" role="alert">{createError}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="group mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-neutral-900 px-4 text-sm font-medium text-white shadow-xs transition duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#eeeae3] disabled:text-neutral-400 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800 sm:mt-0 sm:w-auto dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:disabled:bg-[#201d1a] dark:disabled:text-neutral-500 dark:disabled:border dark:disabled:border-white/[0.06]"
                    >
                        <ImagePlus size={17} aria-hidden="true" /> Create board
                    </button>
                </form>

                {moodboards.length > 0 ? (
                    <div className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Saved boards <span className="ml-1 font-normal text-neutral-500 dark:text-neutral-400">({moodboards.length})</span></h2>
                        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                        {moodboards.map(board => (
                            <article key={board.id} className="group relative overflow-hidden rounded-[20px] bg-neutral-200 transition-shadow duration-300 hover:shadow-lg dark:bg-neutral-800 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)]">
                                <Link
                                    to={`/moodboards/${board.id}`}
                                    aria-label={`${board.title}, ${board.media.length} saved ${board.media.length === 1 ? "item" : "items"}`}
                                    className="relative block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                >
                                    <MoodboardPreview moodboard={board} />
                                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-3 pb-3 sm:gap-3 sm:px-5 sm:pb-5">
                                        <span className="min-w-0">
                                            <span className="block truncate text-base font-medium text-white sm:text-2xl">{board.title}</span>
                                            <span className="mt-1 flex items-center gap-1 text-[10px] text-white/80 sm:gap-1.5 sm:text-xs" aria-hidden="true">
                                                {board.isPublic ? <Globe2 size={11} className="text-emerald-400 sm:size-3" /> : <LockKeyhole size={11} className="sm:size-3" />}
                                                <span>{board.media.length} {board.media.length === 1 ? "item" : "items"}</span>
                                                <span className="text-white/40">·</span>
                                                <span>{board.isPublic ? "Public" : "Private"}</span>
                                            </span>
                                        </span>
                                        <ArrowUpRight size={16} className="mb-1 shrink-0 text-white/80 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-[18px]" aria-hidden="true" />
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    aria-label={`Delete ${board.title}`}
                                    title="Delete moodboard"
                                    className="media-action absolute right-2 top-2 grid size-8 place-items-center rounded-full border border-white/80 bg-black/25 text-white shadow-sm backdrop-blur-sm hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-3 sm:top-3 sm:size-9"
                                    onClick={() => setMoodboardToDelete(board)}
                                >
                                    <Trash2 size={14} className="sm:size-[17px]" aria-hidden="true" />
                                </button>
                            </article>
                        ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-white/50 px-5 py-10 text-center dark:border-white/15 dark:bg-[#1a1917]/50 sm:py-14">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f4efe9] text-neutral-600 dark:bg-[#25221e] dark:text-neutral-300">
                            <ImagePlus size={20} aria-hidden="true" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">Your inspiration starts here</h2>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            Create a moodboard above, then save photos and videos as you browse.
                        </p>
                        <Link to="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-white/10 dark:bg-[#1a1917] dark:text-neutral-200 dark:hover:bg-white/[0.05]">
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
        </div>
    )
}

export default MoodboardsPage
