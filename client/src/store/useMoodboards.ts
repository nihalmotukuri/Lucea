import { create } from "zustand"
import axios from "axios"
import type { Moodboard, MoodboardMedia } from "@/types/types"
import { deleteCloudMoodboard, fetchMoodboards, saveMoodboard } from "@/api/moodboards"

interface MoodboardsState {
    moodboards: Moodboard[]
    accountId: string | null
    isSyncing: boolean
    isCloudSynced: boolean
    syncError: string | null
    createMoodboard: (title: string, media?: MoodboardMedia) => string | null
    addMedia: (moodboardId: string, media: MoodboardMedia) => void
    removeMedia: (moodboardId: string, mediaKey: string) => void
    setMoodboardVisibility: (moodboardId: string, isPublic: boolean) => Promise<void>
    deleteMoodboard: (moodboardId: string) => void
    syncWithAccount: (userId: string, accessToken: string) => Promise<void>
    clearAccount: () => void
    retrySync: () => Promise<void>
}

let activeAccessToken: string | null = null
const writeQueue = new Map<string, Promise<void>>()
const pendingDeletes = new Set<string>()

const reportSyncError = (error: unknown, userId?: string) => {
    if (userId && useMoodboards.getState().accountId !== userId) return
    let message = error instanceof Error ? error.message : "Moodboard update failed."
    if (axios.isAxiosError(error)) {
        const response = error.response?.data as { error?: unknown; code?: unknown } | undefined
        const serverMessage = typeof response?.error === "string" ? response.error : null
        const serverCode = typeof response?.code === "string" ? response.code : null
        if (error.response?.status === 500) {
            message = serverCode
                ? `The moodboard service hit an internal error (${serverCode}). Check the server log for details.`
                : "The moodboard service hit an internal error. Check the server log for details."
        } else if (serverMessage) {
            message = serverMessage
        } else if (!error.response) {
            message = "Could not reach the moodboard service. Check your connection and try again."
        }
    }
    useMoodboards.setState({ syncError: message, isCloudSynced: false })
}

const enqueueWrite = (key: string, userId: string, operation: () => Promise<void>) => {
    const previous = writeQueue.get(key) ?? Promise.resolve()
    const queued = previous.catch(() => undefined).then(operation)
    writeQueue.set(key, queued)

    void queued.then(
        () => {
            if (writeQueue.get(key) === queued) {
                writeQueue.delete(key)
                if (writeQueue.size === 0 && useMoodboards.getState().accountId === userId) {
                    useMoodboards.setState({ isCloudSynced: true, syncError: null })
                }
            }
        },
        error => {
            reportSyncError(error, userId)
            if (writeQueue.get(key) === queued) writeQueue.delete(key)
        },
    )
    return queued
}

const persistBoard = (userId: string, accessToken: string, moodboard: Moodboard) =>
    enqueueWrite(moodboard.id, userId, async () => {
        await saveMoodboard(accessToken, moodboard)
        if (useMoodboards.getState().accountId === userId) {
            pendingDeletes.delete(moodboard.id)
        }
    })

export const useMoodboards = create<MoodboardsState>((set, get) => ({
    moodboards: [],
    accountId: null,
    isSyncing: false,
    isCloudSynced: false,
    syncError: null,
    createMoodboard: (title, media) => {
        const { accountId } = get()
        const accessToken = activeAccessToken
        if (!accountId || !accessToken) return null

        const moodboard: Moodboard = {
            id: crypto.randomUUID(),
            title,
            createdAt: Date.now(),
            media: media ? [media] : [],
            isPublic: false,
        }
        set(state => ({
            moodboards: [...state.moodboards, moodboard],
            isCloudSynced: false,
            syncError: null,
        }))
        void persistBoard(accountId, accessToken, moodboard)
        return moodboard.id
    },
    addMedia: (moodboardId, media) => {
        const { accountId, moodboards } = get()
        const accessToken = activeAccessToken
        if (!accountId || !accessToken) return

        const moodboard = moodboards.find(board => board.id === moodboardId)
        if (!moodboard || moodboard.media.some(item => item.key === media.key)) return

        const updated = { ...moodboard, media: [...moodboard.media, media] }
        set(state => ({
            moodboards: state.moodboards.map(board => board.id === moodboardId ? updated : board),
            isCloudSynced: false,
            syncError: null,
        }))
        void persistBoard(accountId, accessToken, updated)
    },
    removeMedia: (moodboardId, mediaKey) => {
        const { accountId, moodboards } = get()
        const accessToken = activeAccessToken
        if (!accountId || !accessToken) return

        const moodboard = moodboards.find(board => board.id === moodboardId)
        if (!moodboard) return

        const updated = { ...moodboard, media: moodboard.media.filter(item => item.key !== mediaKey) }
        set(state => ({
            moodboards: state.moodboards.map(board => board.id === moodboardId ? updated : board),
            isCloudSynced: false,
            syncError: null,
        }))
        void persistBoard(accountId, accessToken, updated)
    },
    setMoodboardVisibility: async (moodboardId, isPublic) => {
        const { accountId, moodboards } = get()
        const accessToken = activeAccessToken
        if (!accountId || !accessToken) throw new Error("Sign in to change moodboard visibility.")

        const moodboard = moodboards.find(board => board.id === moodboardId)
        if (!moodboard) throw new Error("Moodboard not found.")
        if (moodboard.isPublic === isPublic) return

        const updated = { ...moodboard, isPublic }
        set(state => ({
            moodboards: state.moodboards.map(board => board.id === moodboardId ? updated : board),
            isCloudSynced: false,
            syncError: null,
        }))
        try {
            await persistBoard(accountId, accessToken, updated)
        } catch (error) {
            if (get().accountId === accountId) {
                set(state => ({
                    moodboards: state.moodboards.map(board =>
                        board.id === moodboardId && board.isPublic === isPublic ? moodboard : board
                    ),
                }))
            }
            throw error
        }
    },
    deleteMoodboard: moodboardId => {
        const { accountId } = get()
        const accessToken = activeAccessToken
        if (!accountId || !accessToken) return

        set(state => ({
            moodboards: state.moodboards.filter(board => board.id !== moodboardId),
            isCloudSynced: false,
            syncError: null,
        }))
        pendingDeletes.add(moodboardId)
        void enqueueWrite(moodboardId, accountId, async () => {
            await deleteCloudMoodboard(accessToken, moodboardId)
            pendingDeletes.delete(moodboardId)
        })
    },
    syncWithAccount: async (userId, accessToken) => {
        if (get().accountId === userId && activeAccessToken) {
            activeAccessToken = accessToken
            return
        }

        activeAccessToken = accessToken
        set({
            accountId: userId,
            moodboards: [],
            isSyncing: true,
            isCloudSynced: false,
            syncError: null,
        })

        try {
            const moodboards = await fetchMoodboards(accessToken)
            if (get().accountId !== userId) return
            set({ moodboards, isSyncing: false, isCloudSynced: true, syncError: null })
        } catch (error) {
            if (get().accountId !== userId) return
            reportSyncError(error, userId)
            set({ isSyncing: false })
        }
    },
    clearAccount: () => {
        activeAccessToken = null
        pendingDeletes.clear()
        writeQueue.clear()
        set({
            moodboards: [],
            accountId: null,
            isSyncing: false,
            isCloudSynced: false,
            syncError: null,
        })
    },
    retrySync: async () => {
        const { accountId, moodboards } = get()
        const accessToken = activeAccessToken
        if (!accountId || !accessToken) return

        set({ isSyncing: true, syncError: null, isCloudSynced: false })
        try {
            if (moodboards.length === 0 && pendingDeletes.size === 0) {
                const remoteMoodboards = await fetchMoodboards(accessToken)
                if (get().accountId === accountId) {
                    set({
                        moodboards: remoteMoodboards,
                        isSyncing: false,
                        isCloudSynced: true,
                        syncError: null,
                    })
                }
                return
            }

            await Promise.all([
                ...[...pendingDeletes].map(id => enqueueWrite(id, accountId, async () => {
                    await deleteCloudMoodboard(accessToken, id)
                    pendingDeletes.delete(id)
                })),
                ...moodboards.map(moodboard => persistBoard(accountId, accessToken, moodboard)),
            ])
            if (get().accountId === accountId) {
                set({ isSyncing: false, isCloudSynced: true, syncError: null })
            }
        } catch (error) {
            if (get().accountId !== accountId) return
            reportSyncError(error, accountId)
            set({ isSyncing: false })
        }
    },
}))
