import assert from "node:assert/strict"
import { once } from "node:events"
import { test } from "node:test"

const redisUrl = process.env.RATE_LIMIT_REDIS_URL

test("production rate limits are shared through Redis", { skip: !redisUrl }, async () => {
    process.env.NODE_ENV = "production"
    process.env.RATE_LIMIT_STORE = "redis"
    process.env.CLIENT_ORIGIN = "http://localhost:5173"
    process.env.TRUST_PROXY_HOPS = "0"
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_PUBLISHABLE_KEY
    delete process.env.SUPABASE_SECRET_KEY
    delete process.env.PEXELS_API_KEY
    delete process.env.GEMINI_API_KEY

    const { closeRateLimitStore, connectRateLimitStore } =
        await import("../src/lib/rateLimitStore.js")
    await connectRateLimitStore()

    try {
        const { default: app } = await import("../src/app.js")
        const server = app.listen(0, "127.0.0.1")
        await once(server, "listening")

        try {
            const baseUrl = `http://127.0.0.1:${server.address().port}`
            const readiness = await fetch(`${baseUrl}/api/health/ready`)
            assert.deepEqual(await readiness.json(), {
                status: "ready",
                rateLimitStore: "connected",
            })

            let response
            for (let request = 0; request < 125; request += 1) {
                response = await fetch(`${baseUrl}/api/pexels/photos/search`)
                if (response.status === 429) break
            }

            assert.equal(response.status, 429)
        } finally {
            server.closeAllConnections()
            await new Promise((resolve, reject) => {
                server.close(error => error ? reject(error) : resolve())
            })
        }
    } finally {
        await closeRateLimitStore()
    }
})
