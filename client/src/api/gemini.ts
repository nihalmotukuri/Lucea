import pexelsApi from "./axiosInstance"

interface KeywordResponse {
    keyword: string
}

interface RecommendationsResponse {
    suggestions: string[]
}

export const generateImageKeyword = async (
    imageUrl: string,
    mediaType: "photo" | "video",
    signal?: AbortSignal,
) => {
    const response = await pexelsApi.post<KeywordResponse>(
        "/gemini/image-keyword",
        { imageUrl, mediaType },
        { signal },
    )
    return response.data
}

export const getSearchRecommendations = async (query: string, signal?: AbortSignal) => {
    const response = await pexelsApi.post<RecommendationsResponse>(
        "/gemini/recommendations",
        { query },
        { signal },
    )
    return response.data.suggestions
}
