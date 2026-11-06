import { RedisStore } from "rate-limit-redis"
import { createClient } from "redis"

const redisUrl = process.env.RATE_LIMIT_REDIS_URL?.trim()
const configuredMode = process.env.RATE_LIMIT_STORE
const mode = configuredMode ?? (redisUrl ? "redis" : "memory")

if (mode !== "redis" && mode !== "memory") {
    throw new Error("RATE_LIMIT_STORE must be either 'redis' or 'memory'.")
}
if (mode === "redis" && !redisUrl) {
    throw new Error("RATE_LIMIT_REDIS_URL is required when RATE_LIMIT_STORE=redis.")
}
if (mode === "memory" && redisUrl) {
    throw new Error("Unset RATE_LIMIT_REDIS_URL or set RATE_LIMIT_STORE=redis.")
}
if (process.env.NODE_ENV === "production" && mode === "memory" && configuredMode !== "memory") {
    throw new Error(
        "Production requires RATE_LIMIT_REDIS_URL. Set RATE_LIMIT_STORE=memory only for an intentional single-instance deployment.",
    )
}
if (process.env.NODE_ENV === "production" && mode === "memory") {
    console.warn("Production is using per-process in-memory rate limits; use one API instance only.")
}

let redisClient
if (mode === "redis") {
    const url = new URL(redisUrl)
    if (url.protocol !== "redis:" && url.protocol !== "rediss:") {
        throw new Error("RATE_LIMIT_REDIS_URL must use the redis:// or rediss:// protocol.")
    }

    redisClient = createClient({ url: redisUrl })
    redisClient.on("error", error => {
        console.error("Rate-limit Redis connection error:", error.code ?? error.name)
    })
}

export const connectRateLimitStore = async () => {
    if (redisClient && !redisClient.isOpen) await redisClient.connect()
}

export const closeRateLimitStore = async () => {
    if (redisClient?.isOpen) await redisClient.quit()
}

export const getRateLimitStoreStatus = () => redisClient
    ? redisClient.isReady ? "connected" : "unavailable"
    : "memory"

export const createRateLimitStore = prefix => redisClient
    ? new RedisStore({
        prefix: `lucea:${prefix}:`,
        sendCommand: (...args) => redisClient.sendCommand(args),
    })
    : undefined
