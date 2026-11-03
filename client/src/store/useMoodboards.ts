import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { Moodboard, MoodboardMedia } from "@/types/types"

interface MoodboardsState {
    moodboards: Moodboard[]
    createMoodboard: (title: string) => string
    addMedia: (moodboardId: string, media: MoodboardMedia) => void
    removeMedia: (moodboardId: string, mediaKey: string) => void
    deleteMoodboard: (moodboardId: string) => void
}

export const useMoodboards = create<MoodboardsState>()(
    persist(
        set => ({
            moodboards: [],
            createMoodboard: title => {
                const id = crypto.randomUUID()
                set(state => ({
                    moodboards: [
                        ...state.moodboards,
                        { id, title, createdAt: Date.now(), media: [] },
                    ],
                }))
                return id
            },
            addMedia: (moodboardId, media) => set(state => ({
                moodboards: state.moodboards.map(moodboard =>
                    moodboard.id === moodboardId &&
                    !moodboard.media.some(item => item.key === media.key)
                        ? { ...moodboard, media: [...moodboard.media, media] }
                        : moodboard
                ),
            })),
            removeMedia: (moodboardId, mediaKey) => set(state => ({
                moodboards: state.moodboards.map(moodboard =>
                    moodboard.id === moodboardId
                        ? { ...moodboard, media: moodboard.media.filter(item => item.key !== mediaKey) }
                        : moodboard
                ),
            })),
            deleteMoodboard: moodboardId => set(state => ({
                moodboards: state.moodboards.filter(moodboard => moodboard.id !== moodboardId),
            })),
        }),
        {
            name: "lucea-moodboards",
            storage: createJSONStorage(() => localStorage),
        }
    )
)
