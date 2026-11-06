import type { Moodboard, PublicMoodboard, PublicMoodboardSummary, PublicProfile } from "@/types/types"
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

export const getOwnProfile = async (accessToken: string) => {
    const response = await pexelsApi.get<{ profile: { userId: string; handle: string } | null }>(
        "/moodboards/profile",
        authConfig(accessToken),
    )
    return response.data.profile
}

export const saveOwnProfile = async (accessToken: string, handle: string) => {
    const response = await pexelsApi.put<{ profile: { userId: string; handle: string } }>(
        "/moodboards/profile",
        { handle },
        authConfig(accessToken),
    )
    return response.data.profile
}

export const getPublicProfile = async (handle: string) => {
    const response = await pexelsApi.get<{ profile: PublicProfile }>(
        `/moodboards/public/profiles/${encodeURIComponent(handle)}`,
    )
    return response.data.profile
}

export const getPublicMoodboard = async (handle: string, moodboardId: string) => {
    const response = await pexelsApi.get<{ moodboard: PublicMoodboard }>(
        `/moodboards/public/profiles/${encodeURIComponent(handle)}/boards/${encodeURIComponent(moodboardId)}`,
    )
    return response.data.moodboard
}

export const searchPublicMoodboards = async (query: string, signal?: AbortSignal) => {
    const response = await pexelsApi.get<{ moodboards: PublicMoodboardSummary[] }>("/moodboards/public/search", {
        params: { q: query },
        signal,
    })
    return response.data.moodboards
}
