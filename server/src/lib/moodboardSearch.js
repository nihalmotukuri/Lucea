const ignoredMoodboardSearchTerms = new Set([
    "and", "for", "the", "with", "from", "into", "your", "you",
    "in", "on", "at", "to", "of", "by", "or", "a", "an",
])

export const normalizeMoodboardSearchText = value => String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

export const getMoodboardSearchMatch = (query, title, mediaAlts = []) => {
    const normalizedQuery = normalizeMoodboardSearchText(query)
    const queryTokens = [...new Set(normalizedQuery.split(" ").filter(token =>
        token.length > 1 && !ignoredMoodboardSearchTerms.has(token),
    ))]
    const titleTokens = new Set(normalizeMoodboardSearchText(title).split(" "))
    const searchableTokens = new Set(
        normalizeMoodboardSearchText([title, ...mediaAlts].join(" ")).split(" "),
    )
    const matchingTokens = queryTokens.filter(token => searchableTokens.has(token)).length
    const titleMatches = queryTokens.filter(token => titleTokens.has(token)).length
    const minimumMatches = queryTokens.length <= 1
        ? 1
        : Math.max(2, Math.ceil(queryTokens.length * 0.5))

    return {
        matchingTokens,
        titleMatches,
        minimumMatches,
        isMatch: queryTokens.length > 0
            && titleMatches > 0
            && matchingTokens >= minimumMatches,
    }
}
