const configuredBaseUrl = process.env.SMOKE_API_BASE_URL

if (!configuredBaseUrl) {
    console.error("Set SMOKE_API_BASE_URL to the deployed API base URL, including /api.")
    process.exitCode = 1
} else {
    let baseUrl
    try {
        baseUrl = new URL(configuredBaseUrl)
        if (
            !["http:", "https:"].includes(baseUrl.protocol)
            || baseUrl.username
            || baseUrl.password
            || !baseUrl.pathname.replace(/\/+$/, "").endsWith("/api")
        ) {
            throw new Error("The API base URL must be an HTTP(S) URL ending in /api.")
        }
    } catch (error) {
        baseUrl = undefined
        console.error("Invalid SMOKE_API_BASE_URL:", error.message)
        process.exitCode = 1
    }

    if (baseUrl) {
        const checks = [
            {
                path: "/health",
                validate: payload => {
                    if (payload.status !== "ok") throw new Error("API health check did not report ok.")
                    for (const service of ["supabase", "pexels", "gemini"]) {
                        if (payload.services?.[service] !== "configured") {
                            throw new Error(`${service} is not configured.`)
                        }
                    }
                },
            },
            {
                path: "/health/ready",
                validate: payload => {
                    if (payload.status !== "ready") {
                        throw new Error("The API or its rate-limit store is not ready.")
                    }
                },
            },
            {
                path: "/health/pexels",
                validate: payload => {
                    if (payload.status !== "connected") throw new Error("Pexels is not connected.")
                },
            },
            {
                path: "/health/gemini",
                validate: payload => {
                    if (payload.status !== "connected") throw new Error("Gemini is not connected.")
                },
            },
            {
                path: "/health/supabase",
                validate: payload => {
                    if (
                        payload.status !== "connected"
                        || payload.moodboards !== "ready"
                        || payload.profiles !== "ready"
                        || payload.publicMoodboardSearch !== "ready"
                    ) {
                        throw new Error(payload.error ?? "Supabase or the public moodboard migrations are not ready.")
                    }
                },
            },
        ]

        for (const check of checks) {
            try {
                const url = new URL(`${baseUrl.pathname.replace(/\/+$/, "")}${check.path}`, baseUrl)
                const response = await fetch(url, { signal: AbortSignal.timeout(20_000) })
                const payload = await response.json()
                if (!response.ok) {
                    throw new Error(payload.error ?? `Health endpoint returned HTTP ${response.status}.`)
                }
                check.validate(payload)
                console.log(`PASS ${check.path}`)
            } catch (error) {
                console.error(`FAIL ${check.path}:`, error.message)
                process.exitCode = 1
            }
        }
    }
}
