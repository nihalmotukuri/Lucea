import type { Photo, Video } from "@/types/types"
import pexelsApi from "./axiosInstance"

interface PexelsResponse<T> {
    photos?: T[]
    videos?: T[]
    next_page?: string
}

export interface MediaPage<T> {
    data: T[]
    nextPage: number | undefined
}

export type MediaOrientation = "landscape" | "portrait" | "square"

const request = async <T>(
    path: string,
    params: Record<string, string | number>,
    signal?: AbortSignal,
) => {
    const response = await pexelsApi.get<PexelsResponse<T>>(path, { params, signal })

    return response.data
}

const toMediaPage = <T>(
    items: T[] | undefined,
    nextPage: string | undefined,
    page: number,
): MediaPage<T> => {
    if (!Array.isArray(items)) {
        throw new Error("The Pexels response did not contain a media list")
    }

    return {
        data: items,
        nextPage: nextPage ? page + 1 : undefined,
    }
}

export const fetchCuratedPhotos = async (
    page: number,
    perPage: number,
    signal?: AbortSignal,
) => {
    const response = await request<Photo>("/pexels/curated", { per_page: perPage, page }, signal)
    return toMediaPage(response.photos, response.next_page, page)
}

export const fetchPopularVideos = async (
    page: number,
    perPage: number,
    signal?: AbortSignal,
) => {
    const response = await request<Video>("/pexels/videos/popular", { per_page: perPage, page }, signal)
    return toMediaPage(response.videos, response.next_page, page)
}

export const searchPhotos = async (
    query: string,
    page: number,
    perPage: number,
    signal?: AbortSignal,
    orientation?: MediaOrientation,
) => {
    const response = await request<Photo>(
        "/pexels/photos/search",
        { query, per_page: perPage, page, ...(orientation ? { orientation } : {}) },
        signal,
    )
    return toMediaPage(response.photos, response.next_page, page)
}

export const searchVideos = async (
    query: string,
    page: number,
    perPage: number,
    signal?: AbortSignal,
    orientation?: MediaOrientation,
) => {
    const response = await request<Video>(
        "/pexels/videos/search",
        { query, per_page: perPage, page, ...(orientation ? { orientation } : {}) },
        signal,
    )
    return toMediaPage(response.videos, response.next_page, page)
}

export const getPhoto = async (id: string, signal?: AbortSignal) => {
    const response = await pexelsApi.get<Photo>(`/pexels/photos/${encodeURIComponent(id)}`, { signal })
    return response.data
}

export const getPhotoDownloadUrl = (id: string) =>
    pexelsApi.getUri({ url: `/pexels/photos/${encodeURIComponent(id)}/download` })

export const getVideo = async (id: string, signal?: AbortSignal) => {
    const response = await pexelsApi.get<Video>(`/pexels/videos/${encodeURIComponent(id)}`, { signal })
    return response.data
}
