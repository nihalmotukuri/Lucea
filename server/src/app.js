import cors from "cors"
import express from "express"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { getSupabaseClient, isSupabaseConfigured } from "./lib/supabase.js"
import { fetchPexels } from "./lib/pexels.js"
import { createRateLimitStore, getRateLimitStoreStatus } from "./lib/rateLimitStore.js"
import geminiRouter, { testGeminiConnection } from "./routes/gemini.js"
import moodboardsRouter from "./routes/moodboards.js"
import pexelsRouter from "./routes/pexels.js"

const app = express()
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0)
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    throw new Error("TRUST_PROXY_HOPS must be a non-negative integer.")
}

app.set("trust proxy", trustProxyHops)

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createRateLimitStore("api"),
})
const geminiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createRateLimitStore("gemini"),
})
const healthCheckLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createRateLimitStore("health"),
})
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean)

app.disable("x-powered-by")
app.use(helmet())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: "1mb" }))
app.use("/api/pexels", apiLimiter, pexelsRouter)
app.use("/api/gemini", geminiLimiter, geminiRouter)
app.use("/api/moodboards", apiLimiter, moodboardsRouter)

app.get("/api/health", (_request, response) => {
    response.json({
        status: "ok",
        services: {
            supabase: isSupabaseConfigured() ? "configured" : "not_configured",
            pexels: process.env.PEXELS_API_KEY ? "configured" : "not_configured",
            gemini: process.env.GEMINI_API_KEY ? "configured" : "not_configured",
        },
    })
})

app.get("/api/health/ready", (_request, response) => {
    const rateLimitStore = getRateLimitStoreStatus()
    if (rateLimitStore === "unavailable") {
        response.status(503).json({ status: "not_ready", rateLimitStore })
        return
    }

    response.json({ status: "ready", rateLimitStore })
})

app.get("/api/health/pexels", healthCheckLimiter, async (_request, response) => {
    if (!process.env.PEXELS_API_KEY) {
        response.status(503).json({ status: "unavailable", error: "Pexels is not configured." })
        return
    }

    try {
        const upstream = await fetchPexels("/v1/curated", { per_page: 1, page: 1 })
        if (!upstream.ok) {
            response.status(502).json({ status: "error", error: "Pexels connection failed." })
            return
        }

        response.json({ status: "connected" })
    } catch (error) {
        console.warn("Pexels health check failed:", error.cause?.code ?? error.name)
        response.status(502).json({ status: "error", error: "Pexels connection failed." })
    }
})

app.get("/api/health/gemini", healthCheckLimiter, async (_request, response) => {
    if (!process.env.GEMINI_API_KEY) {
        response.status(503).json({ status: "unavailable", error: "Gemini is not configured." })
        return
    }

    try {
        await testGeminiConnection()
        response.json({ status: "connected" })
    } catch {
        response.status(502).json({ status: "error", error: "Gemini connection failed." })
    }
})

app.get("/api/health/supabase", healthCheckLimiter, async (_request, response, next) => {
    if (!isSupabaseConfigured()) {
        response.status(503).json({
            status: "unavailable",
            error: "Supabase is not configured. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY.",
        })
        return
    }

    try {
        const { error } = await getSupabaseClient().auth.admin.listUsers({
            page: 1,
            perPage: 1,
        })
        if (error) throw error

        const { error: schemaError } = await getSupabaseClient()
            .from("moodboards")
            .select("id, is_public")
            .limit(0)
        if (["PGRST204", "PGRST205", "42P01"].includes(schemaError?.code)) {
            response.status(503).json({
                status: "connected",
                moodboards: "migration_required",
                error: "Apply the Supabase moodboards migration in server/supabase/migrations.",
            })
            return
        }
        if (schemaError) throw schemaError

        const { error: profileSchemaError } = await getSupabaseClient()
            .from("public_profiles")
            .select("user_id, handle")
            .limit(0)
        if (["PGRST204", "PGRST205", "42P01"].includes(profileSchemaError?.code)) {
            response.status(503).json({
                status: "connected",
                moodboards: "ready",
                profiles: "migration_required",
                error: "Apply the public moodboards migration in server/supabase/migrations.",
            })
            return
        }
        if (profileSchemaError) throw profileSchemaError

        response.json({ status: "connected", moodboards: "ready", profiles: "ready" })
    } catch (error) {
        next(error)
    }
})

app.use((_request, response) => {
    response.status(404).json({ error: "Not found" })
})

app.use((error, _request, response, _next) => {
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
        ? error.status
        : 500
    if (status === 500) {
        console.error("Unhandled server error:", {
            method: _request.method,
            path: _request.originalUrl,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            stack: error.stack,
        })
    }
    response.status(status).json({
        error: status === 500 ? "Internal server error" : error.message,
        ...(typeof error.code === "string" ? { code: error.code } : {}),
    })
})

export default app
