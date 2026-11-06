import assert from "node:assert/strict"
import { once } from "node:events"
import { after, before, test } from "node:test"

process.env.NODE_ENV = "test"
process.env.RATE_LIMIT_STORE = "memory"
process.env.TRUST_PROXY_HOPS = "0"
process.env.CLIENT_ORIGIN = "https://lucea.example"
delete process.env.RATE_LIMIT_REDIS_URL
for (const key of [
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "PEXELS_API_KEY",
    "GEMINI_API_KEY",
]) {
    delete process.env[key]
}

let server
let baseUrl

before(async () => {
    const { default: app } = await import("../src/app.js")
    server = app.listen(0, "127.0.0.1")
    await once(server, "listening")
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    server.closeAllConnections()
    await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve())
    })
})

test("health reports application status without exposing provider secrets", async () => {
    const response = await fetch(`${baseUrl}/api/health`)
    const payload = await response.json()

    assert.equal(response.status, 200)
    assert.equal(payload.status, "ok")
    assert.deepEqual(payload.services, {
        supabase: "not_configured",
        pexels: "not_configured",
        gemini: "not_configured",
    })
    assert.equal(response.headers.get("x-content-type-options"), "nosniff")
})

test("readiness reports the active rate-limit store", async () => {
    const response = await fetch(`${baseUrl}/api/health/ready`)

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: "ready", rateLimitStore: "memory" })
})

test("CORS allows the configured client origin", async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: "https://lucea.example" },
    })

    assert.equal(response.headers.get("access-control-allow-origin"), "https://lucea.example")
})

test("Pexels search rejects missing queries before contacting the provider", async () => {
    const response = await fetch(`${baseUrl}/api/pexels/photos/search`)

    assert.equal(response.status, 400)
    assert.match((await response.json()).error, /query/i)
})

test("Pexels detail rejects invalid identifiers", async () => {
    const response = await fetch(`${baseUrl}/api/pexels/photos/not-an-id`)

    assert.equal(response.status, 400)
    assert.match((await response.json()).error, /photo ID/i)
})

test("Gemini recommendations reject invalid input before provider access", async () => {
    const response = await fetch(`${baseUrl}/api/gemini/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: " ".repeat(201) }),
    })

    assert.equal(response.status, 400)
    assert.match((await response.json()).error, /query/i)
})

test("moodboard routes fail explicitly when server auth is not configured", async () => {
    const response = await fetch(`${baseUrl}/api/moodboards`)

    assert.equal(response.status, 503)
    assert.match((await response.json()).error, /Supabase Auth/i)
})

test("public moodboard discovery reports missing Supabase configuration", async () => {
    const response = await fetch(`${baseUrl}/api/moodboards/public/search?q=interiors`)

    assert.equal(response.status, 503)
    assert.match((await response.json()).error, /Supabase database/i)
})

test("public profile routes report missing Supabase configuration", async () => {
    const response = await fetch(`${baseUrl}/api/moodboards/public/profiles/ramesh_gupta`)

    assert.equal(response.status, 503)
    assert.match((await response.json()).error, /Supabase database/i)
})

test("unknown API routes return a JSON 404", async () => {
    const response = await fetch(`${baseUrl}/api/does-not-exist`)

    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), { error: "Not found" })
})

test("API rate limits eventually return 429", async () => {
    let lastResponse
    for (let request = 0; request < 125; request += 1) {
        lastResponse = await fetch(`${baseUrl}/api/pexels/photos/search`)
        if (lastResponse.status === 429) break
    }

    assert.equal(lastResponse.status, 429)
})
