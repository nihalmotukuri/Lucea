import type { Moodboard } from "@/types/types"
import pexelsApi from "./axiosInstance"

interface MoodboardsResponse {
    moodboards: Moodboard[]
}

const authConfig = (accessToken: string) => ({
    headers: { Authorization: `Bearer ${accessToken}` },
})

export const fetchMoodboards = async (accessToken: string) => {
    const response = await pexelsApi.get<MoodboardsResponse>(
        "/moodboards",
        authConfig(accessToken),
    )
    return response.data.moodboards
}

export const saveMoodboard = async (accessToken: string, moodboard: Moodboard) => {
    await pexelsApi.post("/moodboards", moodboard, authConfig(accessToken))
}

export const deleteCloudMoodboard = async (accessToken: string, moodboardId: string) => {
    await pexelsApi.delete(`/moodboards/${encodeURIComponent(moodboardId)}`, authConfig(accessToken))
}
