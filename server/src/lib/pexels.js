const pexelsBaseUrl = "https://api.pexels.com"

export const fetchPexels = async (path, params = {}) => {
    const apiKey = process.env.PEXELS_API_KEY
    if (!apiKey) {
        const error = new Error("Pexels is not configured on the server.")
        error.status = 503
        throw error
    }

    const url = new URL(path, pexelsBaseUrl)
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) url.searchParams.set(key, String(value))
    }

    let lastError
    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            return await fetch(url, {
                headers: { Authorization: apiKey },
                signal: AbortSignal.timeout(20_000),
            })
        } catch (cause) {
            lastError = cause
        }
    }

    const error = new Error("Pexels is temporarily unreachable.", { cause: lastError })
    error.status = 502
    throw error
}
