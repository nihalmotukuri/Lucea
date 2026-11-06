import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { createServer } from "node:http"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const serverDirectory = fileURLToPath(new URL("../", import.meta.url))

test("smoke check verifies API readiness and all production providers", async () => {
    const visitedPaths = []
    const server = createServer((request, response) => {
        visitedPaths.push(request.url)
        const payloads = {
            "/api/health": {
                status: "ok",
                services: { supabase: "configured", pexels: "configured", gemini: "configured" },
            },
            "/api/health/ready": { status: "ready", rateLimitStore: "connected" },
            "/api/health/pexels": { status: "connected" },
            "/api/health/gemini": { status: "connected" },
            "/api/health/supabase": { status: "connected", moodboards: "ready", profiles: "ready" },
        }
        response.setHeader("Content-Type", "application/json")
        response.end(JSON.stringify(payloads[request.url] ?? { error: "Not found" }))
    })
    server.listen(0, "127.0.0.1")
    await once(server, "listening")

    try {
        const baseUrl = `http://127.0.0.1:${server.address().port}/api`
        const child = spawn(process.execPath, ["scripts/smoke-check.js"], {
            cwd: serverDirectory,
            env: { ...process.env, SMOKE_API_BASE_URL: baseUrl },
            stdio: ["ignore", "pipe", "pipe"],
        })
        let output = ""
        child.stdout.setEncoding("utf8").on("data", chunk => { output += chunk })
        child.stderr.setEncoding("utf8").on("data", chunk => { output += chunk })
        const [exitCode] = await once(child, "close")

        assert.equal(exitCode, 0, output)
        assert.equal(visitedPaths.length, 5)
        assert.match(output, /PASS \/health\/ready/)
        assert.match(output, /PASS \/health\/supabase/)
    } finally {
        server.closeAllConnections()
        await new Promise((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve())
        })
    }
})

test("smoke check rejects an API URL without the /api suffix", async () => {
    const child = spawn(process.execPath, ["scripts/smoke-check.js"], {
        cwd: serverDirectory,
        env: { ...process.env, SMOKE_API_BASE_URL: "https://api.example.com/" },
        stdio: ["ignore", "pipe", "pipe"],
    })
    let output = ""
    child.stderr.setEncoding("utf8").on("data", chunk => { output += chunk })
    const [exitCode] = await once(child, "close")

    assert.equal(exitCode, 1)
    assert.match(output, /ending in \/api/)
})
