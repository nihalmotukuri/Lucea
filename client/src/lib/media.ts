export type MediaSortOrder = "relevance" | "largest" | "smallest"

export const sortMediaBySize = <T extends { width: number; height: number }>(
    media: T[],
    sortOrder: MediaSortOrder,
): T[] => {
    if (sortOrder === "relevance") return media

    return media
        .map((item, index) => ({ item, index, area: item.width * item.height }))
        .sort((a, b) => {
            const sizeDifference = sortOrder === "largest" ? b.area - a.area : a.area - b.area
            return sizeDifference || a.index - b.index
        })
        .map(({ item }) => item)
}
