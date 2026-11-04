import { Router } from "express"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import { fetchPexels } from "../lib/pexels.js"

const router = Router()
const orientations = new Set(["landscape", "portrait", "square"])
const pexelsImageHost = "images.pexels.com"

const numberParam = (value, fallback, min, max) => {
    const parsed = Number(value)
    if (!Number.isInteger(parsed)) return fallback
    return Math.min(max, Math.max(min, parsed))
}

const proxyPexels = async (request, response, next, path, allowedParams) => {
    try {
        const upstream = await fetchPexels(path, allowedParams)
        const payload = await upstream.json()
        if (!upstream.ok) {
            response.status(upstream.status).json({
                error: "Pexels request failed.",
                ...(payload.error ? { details: payload.error } : {}),
            })
            return
        }

        response.json(payload)
    } catch (error) {
        next(error)
    }
}

const pagination = request => ({
    page: numberParam(request.query.page, 1, 1, 10_000),
    per_page: numberParam(request.query.per_page, 20, 1, 80),
})

const searchParams = request => {
    const query = typeof request.query.query === "string" ? request.query.query.trim() : ""
    if (!query || query.length > 100) return null

    const orientation = typeof request.query.orientation === "string" &&
        orientations.has(request.query.orientation)
        ? request.query.orientation
        : undefined

    return { ...pagination(request), query, ...(orientation ? { orientation } : {}) }
}

router.get("/curated", (request, response, next) => {
    void proxyPexels(request, response, next, "/v1/curated", pagination(request))
})

router.get("/videos/popular", (request, response, next) => {
    void proxyPexels(request, response, next, "/videos/popular", pagination(request))
})

router.get("/photos/search", (request, response, next) => {
    const params = searchParams(request)
    if (!params) {
        response.status(400).json({ error: "A query of 1 to 100 characters is required." })
        return
    }

    void proxyPexels(request, response, next, "/v1/search", params)
})

router.get("/videos/search", (request, response, next) => {
    const params = searchParams(request)
    if (!params) {
        response.status(400).json({ error: "A query of 1 to 100 characters is required." })
        return
    }

    void proxyPexels(request, response, next, "/videos/search", params)
})

router.get("/photos/:id/download", async (request, response, next) => {
    const { id } = request.params
    if (!/^\d{1,20}$/.test(id)) {
        response.status(400).json({ error: "A valid photo ID is required." })
        return
    }

    try {
        const photoResponse = await fetchPexels(`/v1/photos/${id}`)
        if (!photoResponse.ok) {
            response.status(photoResponse.status).json({ error: "Pexels could not retrieve this photo." })
            return
        }

        let photo
        try {
            photo = await photoResponse.json()
        } catch {
            response.status(502).json({ error: "Pexels returned invalid photo data." })
            return
        }

        let originalUrl
        try {
            originalUrl = new URL(photo.src?.original)
        } catch {
            response.status(502).json({ error: "Pexels returned an invalid photo URL." })
            return
        }
        if (originalUrl.protocol !== "https:" || originalUrl.hostname !== pexelsImageHost) {
            response.status(502).json({ error: "Pexels returned an invalid photo URL." })
            return
        }

        const controller = new AbortController()
        const timeoutSignal = AbortSignal.timeout(30_000)
        const abortOnDisconnect = () => {
            if (!response.writableEnded) controller.abort()
        }
        response.once("close", abortOnDisconnect)

        try {
            let imageResponse
            try {
                imageResponse = await fetch(originalUrl, {
                    signal: AbortSignal.any([timeoutSignal, controller.signal]),
                })
            } catch {
                if (response.destroyed) return
                response.status(502).json({ error: "Pexels could not retrieve the original photo." })
                return
            }
            if (!imageResponse.ok) {
                response.status(502).json({ error: "Pexels could not retrieve the original photo." })
                return
            }

            const finalUrl = new URL(imageResponse.url)
            const contentType = imageResponse.headers.get("content-type")?.split(";")[0]
            if (
                finalUrl.protocol !== "https:"
                || finalUrl.hostname !== pexelsImageHost
                || !contentType?.startsWith("image/")
                || !imageResponse.body
            ) {
                response.status(502).json({ error: "Pexels returned an invalid photo download." })
                return
            }

            response.setHeader("Content-Type", contentType)
            response.setHeader("Content-Disposition", `attachment; filename="pexels-photo-${id}.jpg"`)
            response.setHeader("X-Content-Type-Options", "nosniff")
            await pipeline(Readable.fromWeb(imageResponse.body), response)
        } finally {
            response.off("close", abortOnDisconnect)
        }
    } catch (error) {
        if (response.headersSent) {
            response.destroy(error)
            return
        }
        next(error)
    }
})

router.get("/photos/:id", (request, response, next) => {
    if (!/^\d{1,20}$/.test(request.params.id)) {
        response.status(400).json({ error: "A valid photo ID is required." })
        return
    }

    void proxyPexels(request, response, next, `/v1/photos/${request.params.id}`, {})
})

router.get("/videos/:id", (request, response, next) => {
    if (!/^\d{1,20}$/.test(request.params.id)) {
        response.status(400).json({ error: "A valid video ID is required." })
        return
    }

    void proxyPexels(request, response, next, `/videos/videos/${request.params.id}`, {})
})

export default router
