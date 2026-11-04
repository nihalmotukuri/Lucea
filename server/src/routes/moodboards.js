import { Router } from "express"
import { requireUser } from "../middleware/requireUser.js"
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase.js"

const router = Router()
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const mediaTypes = new Set(["photo", "video"])

const isHttpUrl = value => {
    if (typeof value !== "string" || value.length > 2048) return false
    try {
        const url = new URL(value)
        return url.protocol === "https:" || url.protocol === "http:"
    } catch {
        return false
    }
}

const validateMoodboard = value => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return "A moodboard object is required."
    if (typeof value.id !== "string" || !uuidPattern.test(value.id)) return "Moodboard ID must be a UUID."
    if (typeof value.title !== "string" || !value.title.trim() || value.title.length > 60) {
        return "Moodboard title must contain 1 to 60 characters."
    }
    if (!Number.isFinite(value.createdAt) || value.createdAt < 0) return "Moodboard creation time is invalid."
    if (!Array.isArray(value.media) || value.media.length > 500) {
        return "Moodboard media must be a list of at most 500 items."
    }

    for (const item of value.media) {
        if (
            !item || typeof item !== "object" ||
            typeof item.key !== "string" || item.key.length > 100 ||
            !mediaTypes.has(item.type) ||
            !Number.isSafeInteger(item.id) || item.id < 0 ||
            typeof item.detailPath !== "string" || item.detailPath.length > 300 ||
            !item.detailPath.startsWith("/") || item.detailPath.startsWith("//") ||
            !isHttpUrl(item.thumbnail) ||
            typeof item.alt !== "string" || item.alt.length > 500 ||
            typeof item.creator !== "string" || item.creator.length > 200
        ) {
            return "Moodboard contains invalid media."
        }
    }

    return null
}

router.use(requireUser)

router.get("/", async (request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }

    try {
        const { data, error } = await getSupabaseClient()
            .from("moodboards")
            .select("id, title, created_at, media")
            .eq("user_id", request.user.id)
            .order("created_at", { ascending: false })
        if (error) throw error

        response.json({
            moodboards: data.map(board => ({
                id: board.id,
                title: board.title,
                createdAt: new Date(board.created_at).getTime(),
                media: board.media,
            })),
        })
    } catch (error) {
        next(error)
    }
})

router.post("/", async (request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }

    const validationError = validateMoodboard(request.body)
    if (validationError) {
        response.status(400).json({ error: validationError })
        return
    }

    try {
        const moodboard = request.body
        const { error } = await getSupabaseClient()
            .from("moodboards")
            .upsert({
                id: moodboard.id,
                user_id: request.user.id,
                title: moodboard.title.trim(),
                created_at: new Date(moodboard.createdAt).toISOString(),
                media: moodboard.media,
            }, { onConflict: "user_id,id" })
        if (error) throw error

        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", async (request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }
    if (!uuidPattern.test(request.params.id)) {
        response.status(400).json({ error: "Moodboard ID must be a UUID." })
        return
    }

    try {
        const { error } = await getSupabaseClient()
            .from("moodboards")
            .delete()
            .eq("id", request.params.id)
            .eq("user_id", request.user.id)
        if (error) throw error

        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

export default router
