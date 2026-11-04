import { create } from "zustand"
import axios from "axios"
import type { Moodboard, MoodboardMedia } from "@/types/types"
import { deleteCloudMoodboard, fetchMoodboards, saveMoodboard } from "@/api/moodboards"

const guestStorageKey = "lucea-moodboards"
const accountStorageKey = (userId: string) => `${guestStorageKey}:${userId}`

interface PersistedMoodboards {
    state?: { moodboards?: Moodboard[] }
    moodboards?: Moodboard[]
}

interface MoodboardsState {
    moodboards: Moodboard[]
    accountId: string | null
    isSyncing: boolean
    isCloudSynced: boolean
    syncError: string | null
    createMoodboard: (title: string) => string
    addMedia: (moodboardId: string, media: MoodboardMedia) => void
    removeMedia: (moodboardId: string, mediaKey: string) => void
    deleteMoodboard: (moodboardId: string) => void
    syncWithAccount: (userId: string, accessToken: string) => Promise<void>
    clearAccount: () => void
    retrySync: () => Promise<void>
}

let activeAccessToken: string | null = null
const pendingDeletes = new Map<string, Set<string>>()

const readMoodboards = (key: string): Moodboard[] => {
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return []

        const parsed: PersistedMoodboards = JSON.parse(raw)
        const moodboards = parsed.state?.moodboards ?? parsed.moodboards
        return Array.isArray(moodboards) ? moodboards : []
    } catch (error) {
        console.error(`Unable to load saved moodboards from ${key}:`, error)
        return []
    }
}

const writeMoodboards = (key: string, moodboards: Moodboard[]) => {
    try {
        localStorage.setItem(key, JSON.stringify({ state: { moodboards }, version: 0 }))
    } catch (error) {
        console.error("Unable to save moodboards locally:", error)
        throw error
    }
}

const mergeMoodboards = (...groups: Moodboard[][]) => {
    const merged = new Map<string, Moodboard>()
    for (const group of groups) {
        for (const moodboard of group) {
            const existing = merged.get(moodboard.id)
            if (!existing) {
                merged.set(moodboard.id, {
                    ...moodboard,
                    media: [...moodboard.media],
                })
                continue
            }

            const mediaByKey = new Map(existing.media.map(item => [item.key, item]))
            for (const item of moodboard.media) {
                if (!mediaByKey.has(item.key)) mediaByKey.set(item.key, item)
            }
            existing.media = [...mediaByKey.values()]
        }
    }
    return [...merged.values()].sort((left, right) => left.createdAt - right.createdAt)
}

const persistForCurrentAccount = (accountId: string | null, moodboards: Moodboard[]) => {
    writeMoodboards(accountId ? accountStorageKey(accountId) : guestStorageKey, moodboards)
}

const reportSyncError = (userId: string, error: unknown) => {
    if (useMoodboards.getState().accountId !== userId) return
    let message = error instanceof Error ? error.message : "Moodboard sync failed."
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

const syncBoard = async (userId: string, accessToken: string, moodboard: Moodboard) => {
    try {
        await saveMoodboard(accessToken, moodboard)
    } catch (error) {
        reportSyncError(userId, error)
        throw error
    }
}

export const useMoodboards = create<MoodboardsState>((set, get) => ({
    moodboards: typeof window === "undefined" ? [] : readMoodboards(guestStorageKey),
    accountId: null,
    isSyncing: false,
    isCloudSynced: false,
    syncError: null,
    createMoodboard: title => {
        const moodboard: Moodboard = {
            id: crypto.randomUUID(),
            title,
            createdAt: Date.now(),
            media: [],
        }
        const moodboards = [...get().moodboards, moodboard]
        set({ moodboards })
        persistForCurrentAccount(get().accountId, moodboards)

        const { accountId } = get()
        if (accountId && activeAccessToken) {
            void syncBoard(accountId, activeAccessToken, moodboard).catch(() => undefined)
        }
        return moodboard.id
    },
    addMedia: (moodboardId, media) => {
        const moodboards = get().moodboards.map(moodboard =>
            moodboard.id === moodboardId &&
            !moodboard.media.some(item => item.key === media.key)
                ? { ...moodboard, media: [...moodboard.media, media] }
                : moodboard
        )
        set({ moodboards })
        persistForCurrentAccount(get().accountId, moodboards)

        const { accountId } = get()
        const updated = moodboards.find(item => item.id === moodboardId)
        if (accountId && activeAccessToken && updated) {
            void syncBoard(accountId, activeAccessToken, updated).catch(() => undefined)
        }
    },
    removeMedia: (moodboardId, mediaKey) => {
        const moodboards = get().moodboards.map(moodboard =>
            moodboard.id === moodboardId
                ? { ...moodboard, media: moodboard.media.filter(item => item.key !== mediaKey) }
                : moodboard
        )
        set({ moodboards })
        persistForCurrentAccount(get().accountId, moodboards)

        const { accountId } = get()
        const updated = moodboards.find(item => item.id === moodboardId)
        if (accountId && activeAccessToken && updated) {
            void syncBoard(accountId, activeAccessToken, updated).catch(() => undefined)
        }
    },
    deleteMoodboard: moodboardId => {
        const moodboards = get().moodboards.filter(moodboard => moodboard.id !== moodboardId)
        set({ moodboards })
        persistForCurrentAccount(get().accountId, moodboards)

        const { accountId } = get()
        const token = activeAccessToken
        if (accountId && token) {
            void deleteCloudMoodboard(token, moodboardId).catch(error => {
                const deletedIds = pendingDeletes.get(accountId) ?? new Set<string>()
                deletedIds.add(moodboardId)
                pendingDeletes.set(accountId, deletedIds)
                reportSyncError(accountId, error)
            })
        }
    },
    syncWithAccount: async (userId, accessToken) => {
        if (get().accountId === userId && activeAccessToken) {
            activeAccessToken = accessToken
            return
        }

        const guestMoodboards = get().accountId
            ? readMoodboards(guestStorageKey)
            : get().moodboards
        const cachedAccountMoodboards = readMoodboards(accountStorageKey(userId))
        activeAccessToken = accessToken
        set({
            accountId: userId,
            moodboards: mergeMoodboards(cachedAccountMoodboards, guestMoodboards),
            isSyncing: true,
            isCloudSynced: false,
            syncError: null,
        })

        try {
            const remoteMoodboards = await fetchMoodboards(accessToken)
            if (get().accountId !== userId) return

            const deletedIds = pendingDeletes.get(userId) ?? new Set<string>()
            const moodboards = mergeMoodboards(remoteMoodboards, cachedAccountMoodboards, guestMoodboards)
                .filter(moodboard => !deletedIds.has(moodboard.id))
            set({ moodboards })
            persistForCurrentAccount(userId, moodboards)
            await Promise.all([...deletedIds].map(id => deleteCloudMoodboard(accessToken, id)))
            pendingDeletes.delete(userId)
            await Promise.all(moodboards.map(moodboard => saveMoodboard(accessToken, moodboard)))
            if (get().accountId !== userId) return

            localStorage.removeItem(guestStorageKey)
            set({ isSyncing: false, isCloudSynced: true, syncError: null })
        } catch (error) {
            reportSyncError(userId, error)
            if (get().accountId === userId) set({ isSyncing: false })
        }
    },
    clearAccount: () => {
        activeAccessToken = null
        set({
            accountId: null,
            moodboards: readMoodboards(guestStorageKey),
            isSyncing: false,
            isCloudSynced: false,
            syncError: null,
        })
    },
    retrySync: async () => {
        const { accountId, moodboards } = get()
        const token = activeAccessToken
        if (!accountId || !token) return

        set({ isSyncing: true, syncError: null, isCloudSynced: false })
        try {
            const deletedIds = pendingDeletes.get(accountId) ?? new Set<string>()
            await Promise.all([...deletedIds].map(id => deleteCloudMoodboard(token, id)))
            pendingDeletes.delete(accountId)
            await Promise.all(moodboards.map(moodboard => saveMoodboard(token, moodboard)))
            if (get().accountId === accountId) {
                set({ isSyncing: false, isCloudSynced: true, syncError: null })
            }
        } catch (error) {
            reportSyncError(accountId, error)
            set({ isSyncing: false })
        }
    },
}))
