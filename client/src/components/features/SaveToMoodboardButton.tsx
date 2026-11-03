import { useEffect, useRef, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { BookmarkPlus, Check, X } from "lucide-react"
import type { MoodboardMedia } from "@/types/types"
import { useMoodboards } from "@/store/useMoodboards"

interface SaveToMoodboardButtonProps {
    media: MoodboardMedia
}

const SaveToMoodboardButton = ({ media }: SaveToMoodboardButtonProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState("")
    const dialogRef = useRef<HTMLDialogElement>(null)
    const moodboards = useMoodboards(state => state.moodboards)
    const createMoodboard = useMoodboards(state => state.createMoodboard)
    const addMedia = useMoodboards(state => state.addMedia)

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

        const moodboardId = createMoodboard(trimmedTitle)
        addMedia(moodboardId, media)
        setTitle("")
        setIsOpen(false)
    }

    return (
        <>
            <button
                type="button"
                aria-label="Save to moodboard"
                title="Save to moodboard"
                className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-neutral-800 shadow transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                onClick={() => setIsOpen(true)}
            >
                <BookmarkPlus size={18} aria-hidden="true" />
            </button>

            {isOpen && createPortal(
                <dialog
                    ref={dialogRef}
                    aria-labelledby="moodboard-dialog-title"
                    className="fixed inset-0 m-auto max-h-[85vh] w-[min(92vw,28rem)] overflow-y-auto rounded-2xl border border-black/10 bg-[#fdfcfb] p-0 text-neutral-800 shadow-2xl backdrop:bg-black/40"
                    onCancel={event => {
                        event.preventDefault()
                        setIsOpen(false)
                    }}
                    onClose={() => setIsOpen(false)}
                    onClick={event => {
                        if (event.target === dialogRef.current) setIsOpen(false)
                    }}
                >
                    <div className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 id="moodboard-dialog-title" className="text-xl font-semibold">Save to a moodboard</h2>
                            <button
                                type="button"
                                aria-label="Close"
                                className="rounded-full p-2 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <form onSubmit={onCreateMoodboard} className="mb-4 flex gap-2">
                            <input
                                autoFocus
                                aria-label="New moodboard name"
                                className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                                maxLength={60}
                                placeholder="Create a moodboard"
                                value={title}
                                onChange={event => setTitle(event.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!title.trim()}
                                className="rounded-xl bg-neutral-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Create
                            </button>
                        </form>

                        {moodboards.length > 0 ? (
                            <ul className="max-h-64 space-y-1 overflow-y-auto">
                                {moodboards.map(moodboard => {
                                    const isSaved = moodboard.media.some(item => item.key === media.key)
                                    return (
                                        <li key={moodboard.id}>
                                            <button
                                                type="button"
                                                disabled={isSaved}
                                                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-black/5 disabled:cursor-default disabled:text-neutral-500"
                                                onClick={() => {
                                                    addMedia(moodboard.id, media)
                                                    setIsOpen(false)
                                                }}
                                            >
                                                <span>{moodboard.title}</span>
                                                {isSaved && <Check size={18} aria-label="Already saved" />}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-neutral-500">Create a moodboard to start collecting ideas.</p>
                        )}
                    </div>
                </dialog>,
                document.body
            )}
        </>
    )
}

export default SaveToMoodboardButton
