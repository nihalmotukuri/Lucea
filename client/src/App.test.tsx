// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Root from "./App"

vi.mock("./components/features/ScrollToTop", () => ({
    ScrollToTop: () => null,
}))

afterEach(cleanup)

describe("application routes", () => {
    it("shows a useful not-found page for unknown URLs", () => {
        window.history.pushState({}, "", "/does-not-exist")
        const queryClient = new QueryClient()

        render(
            <QueryClientProvider client={queryClient}>
                <Root />
            </QueryClientProvider>,
        )

        expect(screen.getByRole("heading", { name: "This page isn’t here." })).toBeTruthy()
        expect(screen.getByRole("link", { name: "Back to explore" }).getAttribute("href")).toBe("/")
        queryClient.clear()
    })
})
