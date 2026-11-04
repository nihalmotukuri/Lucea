import { useEffect, useRef, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { BookmarkCheck, BookmarkPlus, Check, X } from "lucide-react"
import type { MoodboardMedia } from "@/types/types"
import { useMoodboards } from "@/store/useMoodboards"
import { useAuth } from "@/auth/useAuth"

interface SaveToMoodboardButtonProps {
    media: MoodboardMedia
    variant?: "overlay" | "inline"
}

const SaveToMoodboardButton = ({ media, variant = "overlay" }: SaveToMoodboardButtonProps) => {
    const { user, isAuthLoading, openAuthDialog } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [createError, setCreateError] = useState("")
    const [feedback, setFeedback] = useState("")
    const dialogRef = useRef<HTMLDialogElement>(null)
    const moodboards = useMoodboards(state => state.moodboards)
    const accountId = useMoodboards(state => state.accountId)
    const isSyncing = useMoodboards(state => state.isSyncing)
    const createMoodboard = useMoodboards(state => state.createMoodboard)
    const addMedia = useMoodboards(state => state.addMedia)
    const savedBoardCount = moodboards.filter(board => board.media.some(item => item.key === media.key)).length

    useEffect(() => {
        if (!feedback) return
        const timeout = window.setTimeout(() => setFeedback(""), 2600)
        return () => window.clearTimeout(timeout)
    }, [feedback])

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (isOpen && !dialog.open) dialog.showModal()
        if (!isOpen && dialog.open) dialog.close()
    }, [isOpen])

    const onCreateMoodboard = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedTitle = title.trim()
        if (!trimmedTitle) return

        if (moodboards.some(board => board.title.toLocaleLowerCase() === trimmedTitle.toLocaleLowerCase())) {
            setCreateError("A moodboard with this name already exists.")
            return
        }

        const moodboardId = createMoodboard(trimmedTitle, media)
        if (!moodboardId) {
            setCreateError("Sign in to create a moodboard and save this item.")
            return
        }
        setFeedback(`Saved to ${trimmedTitle}`)
        setTitle("")
        setCreateError("")
        setIsOpen(false)
    }

    return (
        <>
            <button
                type="button"
                disabled={isAuthLoading || (Boolean(user) && (isSyncing || !accountId))}
                aria-label={savedBoardCount > 0 ? `Saved to ${savedBoardCount} moodboard${savedBoardCount === 1 ? "" : "s"}. Manage moodboards` : "Save to moodboard"}
                title={!user ? "Sign in to save this item" : savedBoardCount > 0 ? "Saved to moodboard" : "Save to moodboard"}
                className={variant === "overlay"
                    ? "media-action absolute right-3 top-3 z-10 rounded-full border border-white/80 bg-black/25 p-2.5 text-white shadow-sm backdrop-blur-sm hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    : "inline-flex min-h-11 items-center gap-2 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                }
                onClick={() => {
                    if (!user) {
                        openAuthDialog("Create an account or sign in to keep this inspiration in your moodboards.")
                        return
                    }
                    setIsOpen(true)
                }}
            >
                {savedBoardCount > 0
                    ? <BookmarkCheck size={18} aria-hidden="true" />
                    : <BookmarkPlus size={18} aria-hidden="true" />
                }
                {variant === "inline" && (savedBoardCount > 0 ? "Saved" : "Save to moodboard")}
            </button>
            {feedback && (
                <span role="status" aria-live="polite" className={variant === "overlay"
                    ? "absolute bottom-3 left-3 z-10 max-w-[calc(100%-5.5rem)] truncate rounded-full bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
                    : "mt-2 block text-xs font-medium text-neutral-500"
                }>
                    {feedback}
                </span>
            )}

            {isOpen && createPortal(
                <dialog
                    ref={dialogRef}
                    aria-labelledby="moodboard-dialog-title"
                    aria-describedby="moodboard-dialog-description"
                    className="fixed inset-0 m-auto max-h-[min(85dvh,38rem)] w-[min(92vw,30rem)] overflow-hidden rounded-3xl border border-black/10 bg-[#fdfcfb] p-0 text-neutral-800 shadow-2xl backdrop:bg-neutral-950/45 backdrop:backdrop-blur-[2px]"
                    onCancel={event => {
                        event.preventDefault()
                        setIsOpen(false)
                    }}
                    onKeyDown={event => {
                        if (event.key === "Escape") {
                            event.preventDefault()
                            setIsOpen(false)
                        }
                    }}
                    onClose={() => setIsOpen(false)}
                    onClick={event => {
                        if (event.target === dialogRef.current) setIsOpen(false)
                    }}
                >
                    <div className="flex max-h-[min(85dvh,38rem)] flex-col">
                        <div className="flex items-start justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6">
                            <div>
                                <h2 id="moodboard-dialog-title" className="text-lg font-semibold sm:text-xl">
                                    Save to a moodboard
                                </h2>
                                <p id="moodboard-dialog-description" className="mt-1 text-sm text-neutral-500">
                                    Keep this {media.type} with ideas you want to revisit.
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close"
                                className="ml-3 rounded-full p-2 text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <div className="overflow-y-auto px-5 py-4 sm:px-6">
                            <form onSubmit={onCreateMoodboard} className="rounded-2xl border border-black/[0.08] bg-white p-3">
                                <label htmlFor="new-moodboard-name" className="mb-2 block text-xs font-medium text-neutral-600">
                                    Create a new moodboard
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="new-moodboard-name"
                                        autoFocus
                                        aria-invalid={Boolean(createError)}
                                        aria-describedby={createError ? "new-moodboard-error" : undefined}
                                        className="min-w-0 flex-1 rounded-xl border border-black/10 bg-[#fdfcfb] px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-500"
                                        maxLength={60}
                                        placeholder="e.g. Warm autumn tones"
                                        value={title}
                                        onChange={event => {
                                            setTitle(event.target.value)
                                            if (createError) setCreateError("")
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!title.trim()}
                                        className="min-h-11 shrink-0 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                                    >
                                        Create
                                    </button>
                                </div>
                                {createError && <p id="new-moodboard-error" className="mt-2 text-xs text-red-700" role="alert">{createError}</p>}
                            </form>

                            <div className="mb-2 mt-5 flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Your moodboards</h3>
                                {moodboards.length > 0 && (
                                    <span className="text-xs text-neutral-500">{moodboards.length}</span>
                                )}
                            </div>

                            {moodboards.length > 0 ? (
                                <ul className="space-y-1">
                                    {moodboards.map(moodboard => {
                                        const isSaved = moodboard.media.some(item => item.key === media.key)
                                        const preview = moodboard.media[0]?.thumbnail
                                        return (
                                            <li key={moodboard.id}>
                                                <button
                                                    type="button"
                                                    disabled={isSaved}
                                                    className="flex min-h-[4.25rem] w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-black/[0.04] disabled:cursor-default disabled:bg-black/[0.025]"
                                                    onClick={() => {
                                                        addMedia(moodboard.id, media)
                                                        setFeedback(`Saved to ${moodboard.title}`)
                                                        setIsOpen(false)
                                                    }}
                                                >
                                                    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-neutral-100">
                                                        {preview
                                                            ? <img src={preview} alt="" className="h-full w-full object-cover" />
                                                            : <BookmarkPlus size={18} className="text-neutral-400" aria-hidden="true" />
                                                        }
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-medium text-neutral-800">{moodboard.title}</span>
                                                        <span className="mt-0.5 block text-xs text-neutral-500">
                                                            {moodboard.media.length} {moodboard.media.length === 1 ? "item" : "items"}
                                                        </span>
                                                    </span>
                                                    {isSaved
                                                        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500"><Check size={16} aria-hidden="true" /> Saved</span>
                                                        : <BookmarkPlus size={17} className="mr-1 text-neutral-400" aria-hidden="true" />
                                                    }
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <p className="rounded-xl bg-black/[0.025] px-4 py-5 text-center text-sm text-neutral-500">
                                    Create your first moodboard above. You can save this item to it right away.
                                </p>
                            )}
                        </div>
                    </div>
                </dialog>,
                document.body
            )}
        </>
    )
}

export default SaveToMoodboardButton
