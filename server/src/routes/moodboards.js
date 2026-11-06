import { Router } from "express"
import { requireUser } from "../middleware/requireUser.js"
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase.js"
import { getMoodboardSearchMatch, normalizeMoodboardSearchText } from "../lib/moodboardSearch.js"

const router = Router()
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const mediaTypes = new Set(["photo", "video"])

const isPexelsImageUrl = value => {
    if (typeof value !== "string" || value.length > 2048) return false
    try {
        const url = new URL(value)
        return url.protocol === "https:" && url.hostname === "images.pexels.com"
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
    if (value.isPublic !== undefined && typeof value.isPublic !== "boolean") {
        return "Moodboard visibility must be public or private."
    }
    if (!Array.isArray(value.media) || value.media.length > 500) {
        return "Moodboard media must be a list of at most 500 items."
    }

    for (const item of value.media) {
        if (
            !item || typeof item !== "object" ||
            typeof item.key !== "string" || item.key.length > 100 ||
            !mediaTypes.has(item.type) ||
            !Number.isSafeInteger(item.id) || item.id < 0 ||
            item.detailPath !== `/${item.type === "photo" ? "photos" : "videos"}/${item.id}` ||
            !isPexelsImageUrl(item.thumbnail) ||
            typeof item.alt !== "string" || item.alt.length > 500 ||
            typeof item.creator !== "string" || item.creator.length > 200
        ) {
            return "Moodboard contains invalid media."
        }
    }

    return null
}

const serializeMoodboard = board => ({
    id: board.id,
    title: board.title,
    createdAt: new Date(board.created_at).getTime(),
    media: board.media,
    isPublic: board.is_public,
})

const serializePublicMoodboardSummary = (board, handle) => ({
    id: board.id,
    title: board.title,
    createdAt: new Date(board.created_at).getTime(),
    mediaCount: board.media_count ?? board.media.length,
    preview: board.media.slice(0, 3),
    userId: board.user_id,
    handle,
})

const rankPublicMoodboardsFallback = async (supabase, query) => {
    const { data: boards, error: boardsError } = await supabase
        .from("moodboards")
        .select(publicMoodboardFields)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(500)
    if (boardsError) throw boardsError

    const userIds = [...new Set((boards ?? []).map(board => board.user_id))]
    const { data: profiles, error: profilesError } = userIds.length
        ? await supabase
            .from("public_profiles")
            .select(publicProfileFields)
            .in("user_id", userIds)
        : { data: [], error: null }
    if (profilesError) throw profilesError

    const handlesByUserId = new Map((profiles ?? []).map(profile => [profile.user_id, profile.handle]))
    const normalizedQuery = normalizeMoodboardSearchText(query)

    return (boards ?? [])
        .filter(board => handlesByUserId.has(board.user_id))
        .map(board => {
            const match = getMoodboardSearchMatch(query, board.title, board.media.map(item => item.alt))
            const score = (normalizeMoodboardSearchText(board.title).includes(normalizedQuery) ? 12 : 0)
                + match.titleMatches * 4
                + (match.matchingTokens - match.titleMatches) * 1.5
            return { board, score, ...match }
        })
        .filter(result => result.isMatch)
        .sort((left, right) =>
            right.score - left.score
            || new Date(right.board.created_at).getTime() - new Date(left.board.created_at).getTime(),
        )
        .slice(0, 12)
        .map(({ board, score }) => ({
            ...board,
            media: board.media.slice(0, 3),
            media_count: board.media.length,
            handle: handlesByUserId.get(board.user_id),
            relevance: score,
        }))
}

const publicProfileFields = "user_id, handle"
const publicMoodboardFields = "id, user_id, title, created_at, media, is_public"
const handlePattern = /^[a-z0-9_]{3,30}$/

router.get("/public/search", async (request, response, next) => {
    const query = typeof request.query.q === "string" ? request.query.q.trim() : ""
    if (query.length < 2 || query.length > 60) {
        response.status(400).json({ error: "Search query must contain 2 to 60 characters." })
        return
    }

    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }

    try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.rpc("search_public_moodboards", { search_query: query })
        let boards
        if (["PGRST202", "42883"].includes(error?.code)) {
            boards = await rankPublicMoodboardsFallback(supabase, query)
        } else if (error) {
            throw error
        } else {
            boards = data ?? []
        }

        response.json({
            moodboards: boards.map(board => serializePublicMoodboardSummary(board, board.handle)),
        })
    } catch (error) {
        next(error)
    }
})

router.get("/public/profiles/:handle", async (request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }
    if (!handlePattern.test(request.params.handle)) {
        response.status(400).json({ error: "Profile handle is invalid." })
        return
    }

    try {
        const supabase = getSupabaseClient()
        const { data: profile, error: profileError } = await supabase
            .from("public_profiles")
            .select(publicProfileFields)
            .eq("handle", request.params.handle)
            .maybeSingle()
        if (profileError) throw profileError
        if (!profile) {
            response.status(404).json({ error: "This profile could not be found." })
            return
        }

        const { data: boards, error: boardsError } = await supabase
            .from("moodboards")
            .select(publicMoodboardFields)
            .eq("user_id", profile.user_id)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
        if (boardsError) throw boardsError

        response.json({
            profile: {
                userId: profile.user_id,
                handle: profile.handle,
                moodboards: boards.map(board => serializePublicMoodboardSummary(board, profile.handle)),
            },
        })
    } catch (error) {
        next(error)
    }
})

router.get("/public/profiles/:handle/boards/:id", async (request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }
    if (!handlePattern.test(request.params.handle) || !uuidPattern.test(request.params.id)) {
        response.status(400).json({ error: "Profile handle or moodboard ID is invalid." })
        return
    }

    try {
        const supabase = getSupabaseClient()
        const { data: profile, error: profileError } = await supabase
            .from("public_profiles")
            .select(publicProfileFields)
            .eq("handle", request.params.handle)
            .maybeSingle()
        if (profileError) throw profileError
        if (!profile) {
            response.status(404).json({ error: "This profile could not be found." })
            return
        }

        const { data: board, error: boardError } = await supabase
            .from("moodboards")
            .select(publicMoodboardFields)
            .eq("id", request.params.id)
            .eq("user_id", profile.user_id)
            .eq("is_public", true)
            .maybeSingle()
        if (boardError) throw boardError
        if (!board) {
            response.status(404).json({ error: "This public moodboard could not be found." })
            return
        }

        response.json({
            moodboard: {
                ...serializeMoodboard(board),
                userId: board.user_id,
                handle: profile.handle,
            },
        })
    } catch (error) {
        next(error)
    }
})

router.use(requireUser)

router.get("/profile", async (request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }

    try {
        const { data, error } = await getSupabaseClient()
            .from("public_profiles")
            .select(publicProfileFields)
            .eq("user_id", request.user.id)
            .maybeSingle()
        if (error) throw error

        response.json({
            profile: data ? { userId: data.user_id, handle: data.handle } : null,
        })
    } catch (error) {
        next(error)
    }
})

router.put("/profile", async (request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }

    const handle = typeof request.body?.handle === "string" ? request.body.handle.trim().toLowerCase() : ""
    if (!handlePattern.test(handle)) {
        response.status(400).json({ error: "Handle must be 3 to 30 characters using lowercase letters, numbers, or underscores." })
        return
    }

    try {
        const { data, error } = await getSupabaseClient()
            .from("public_profiles")
            .upsert({ user_id: request.user.id, handle }, { onConflict: "user_id" })
            .select(publicProfileFields)
            .single()
        if (error?.code === "23505") {
            response.status(409).json({ error: "That handle is already taken. Try another one." })
            return
        }
        if (error) throw error

        response.json({ profile: { userId: data.user_id, handle: data.handle } })
    } catch (error) {
        next(error)
    }
})

router.get("/", async (request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({ error: "Supabase database is not configured on the server." })
        return
    }

    try {
        const { data, error } = await getSupabaseClient()
            .from("moodboards")
            .select("id, title, created_at, media, is_public")
            .eq("user_id", request.user.id)
            .order("created_at", { ascending: false })
        if (error) throw error

        response.json({
            moodboards: data.map(serializeMoodboard),
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
                is_public: moodboard.isPublic ?? false,
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
