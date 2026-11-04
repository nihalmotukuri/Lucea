import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface GeneratedTopic {
    title: string
    slug: string
}

const jsonResponse = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    })

const constantTimeEquals = async (left: string, right: string) => {
    const encoder = new TextEncoder()
    const [leftHash, rightHash] = await Promise.all([
        crypto.subtle.digest("SHA-256", encoder.encode(left)),
        crypto.subtle.digest("SHA-256", encoder.encode(right)),
    ])
    const leftBytes = new Uint8Array(leftHash)
    const rightBytes = new Uint8Array(rightHash)
    return leftBytes.every((value, index) => value === rightBytes[index])
}

const toSlug = (title: string) =>
    title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

const parseTopics = (text: string): GeneratedTopic[] => {
    const parsed: unknown = JSON.parse(text)
    if (typeof parsed !== "object" || parsed === null || !("topics" in parsed)) {
        throw new Error("Gemini response did not contain a topics list.")
    }

    const rawTopics = (parsed as { topics: unknown }).topics
    if (!Array.isArray(rawTopics) || rawTopics.length !== 10) {
        throw new Error("Gemini must return exactly 10 topics.")
    }

    const topics = rawTopics.map((topic): GeneratedTopic => {
        if (typeof topic !== "object" || topic === null || !("title" in topic)) {
            throw new Error("Gemini returned an invalid topic.")
        }

        const title = (topic as { title: unknown }).title
        if (typeof title !== "string") throw new Error("Gemini returned a topic without a title.")
        const normalizedTitle = title.trim().replace(/\s+/g, " ")
        const wordCount = normalizedTitle.split(" ").length
        if (normalizedTitle.length < 2 || normalizedTitle.length > 32 || wordCount > 4) {
            throw new Error("Gemini returned a topic outside the permitted title length.")
        }

        return { title: normalizedTitle, slug: toSlug(normalizedTitle) }
    })

    const uniqueSlugs = new Set(topics.map(topic => topic.slug))
    if (uniqueSlugs.size !== topics.length || topics.some(topic => !topic.slug)) {
        throw new Error("Gemini returned duplicate or invalid topics.")
    }
    return topics
}

Deno.serve(async request => {
    if (request.method !== "POST") return jsonResponse(405, { error: "Method not allowed." })

    const cronSecret = Deno.env.get("DAILY_TOPICS_CRON_SECRET")
    const providedSecret = request.headers.get("x-cron-secret") ?? ""
    if (!cronSecret || !providedSecret || !(await constantTimeEquals(providedSecret, cronSecret))) {
        return jsonResponse(401, { error: "Unauthorized." })
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-3-flash-preview"
    if (!apiKey || !supabaseUrl || !serviceRoleKey) {
        console.error("Daily topics function is missing required provider configuration.")
        return jsonResponse(503, { error: "Daily topic generation is not configured." })
    }

    try {
        const generation = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: "You curate a visual discovery website. Return exactly 10 distinct, evocative topics for searching photos and videos. Topics should cover varied moods, subjects, visual styles, places, and creative ideas; avoid generic filler and avoid repeating the same category. Each title must be 1 to 4 words, suitable for a compact navigation chip. Return only JSON with shape {\"topics\":[{\"title\":\"...\"}]}.",
                        }],
                    },
                    contents: [{
                        parts: [{
                            text: `Create today's fresh visual discovery topics. Do not repeat this date in a topic: ${new Date().toISOString().slice(0, 10)}.`,
                        }],
                    }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.9,
                    },
                }),
                signal: AbortSignal.timeout(45_000),
            },
        )
        if (!generation.ok) {
            console.error("Gemini daily topic generation failed with status:", generation.status)
            return jsonResponse(502, { error: "Daily topic generation failed." })
        }

        const result = await generation.json()
        const text = result.candidates?.[0]?.content?.parts
            ?.map((part: { text?: unknown }) => part.text)
            .filter((part: unknown): part is string => typeof part === "string")
            .join("")
        if (!text) throw new Error("Gemini returned an empty response.")

        const topics = parseTopics(text)
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        })
        const { error } = await supabase
            .from("daily_topics")
            .upsert({ id: true, topics, updated_at: new Date().toISOString() })
        if (error) {
            console.error("Daily topic database update failed:", error.message)
            return jsonResponse(502, { error: "Daily topics could not be saved." })
        }

        return jsonResponse(200, {
            updated: true,
            count: topics.length,
            updatedAt: new Date().toISOString(),
        })
    } catch (error) {
        console.error(
            "Daily topic refresh failed:",
            error instanceof Error ? error.message : "Unknown error",
        )
        return jsonResponse(502, { error: "Daily topic refresh failed." })
    }
})
