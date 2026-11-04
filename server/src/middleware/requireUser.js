import { getSupabaseAuthClient, isSupabaseAuthConfigured } from "../lib/supabase.js"

export const requireUser = async (request, response, next) => {
    if (!isSupabaseAuthConfigured()) {
        response.status(503).json({ error: "Supabase Auth is not configured on the server." })
        return
    }

    const authorization = request.get("authorization")
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : ""
    if (!token) {
        response.status(401).json({ error: "Sign in to access moodboards." })
        return
    }

    try {
        const { data, error } = await getSupabaseAuthClient().auth.getUser(token)
        if (error || !data.user) {
            response.status(401).json({ error: "Your session is invalid or expired. Sign in again." })
            return
        }

        request.user = data.user
        next()
    } catch (error) {
        next(error)
    }
}
