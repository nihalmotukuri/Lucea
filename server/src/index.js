import "dotenv/config"

const { closeRateLimitStore, connectRateLimitStore } = await import("./lib/rateLimitStore.js")

const port = Number(process.env.PORT ?? 3001)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port between 1 and 65535")
}

const start = async () => {
    await connectRateLimitStore()
    const { default: app } = await import("./app.js")
    const server = await new Promise((resolve, reject) => {
        const listener = app.listen(port)
        listener.once("error", reject)
        listener.once("listening", () => {
            listener.off("error", reject)
            listener.on("error", error => {
                console.error("Lucea API server error:", error.message)
                process.exitCode = 1
            })
            resolve(listener)
        })
    })

    console.log(`Lucea API listening on port ${port}`)

    const shutdown = signal => {
        console.log(`Received ${signal}; shutting down Lucea API.`)
        server.close(error => {
            if (error) {
                console.error("Unable to close the Lucea API server cleanly:", error.message)
                process.exitCode = 1
            }
            void closeRateLimitStore().catch(closeError => {
                console.error("Unable to close the rate-limit store cleanly:", closeError.message)
                process.exitCode = 1
            })
        })
    }
    process.once("SIGINT", () => shutdown("SIGINT"))
    process.once("SIGTERM", () => shutdown("SIGTERM"))
}

start().catch(error => {
    console.error("Unable to start Lucea API:", error.message)
    process.exitCode = 1
})
