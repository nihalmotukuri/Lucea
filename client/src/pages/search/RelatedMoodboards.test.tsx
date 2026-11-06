// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import RelatedMoodboards from "./RelatedMoodboards"

vi.mock("@/api/moodboards", () => ({
    searchPublicMoodboards: vi.fn().mockResolvedValue([{
        id: "11111111-1111-4111-8111-111111111111",
        title: "Warm interiors",
        createdAt: 1,
        mediaCount: 1,
        preview: [{
            key: "photo-1",
            type: "photo",
            id: 1,
            detailPath: "/photos/1",
            thumbnail: "https://images.pexels.com/photo.jpg",
            alt: "Warm room",
            creator: "Photographer",
        }],
        userId: "user-1",
        handle: "ramesh_gupta",
    }]),
}))

afterEach(cleanup)

describe("RelatedMoodboards", () => {
    it("shows matching public boards with a creator link", async () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RelatedMoodboards query="interiors" />
                </MemoryRouter>
            </QueryClientProvider>,
        )

        expect(await screen.findByRole("heading", { name: "Related moodboards" })).toBeTruthy()
        expect((await screen.findByRole("link", { name: "by ramesh_gupta" })).getAttribute("href")).toBe("/profiles/ramesh_gupta")
        expect(screen.getByRole("link", { name: "Warm interiors, 1 saved item" }).getAttribute("href")).toBe("/profiles/ramesh_gupta/boards/11111111-1111-4111-8111-111111111111")
        queryClient.clear()
    })
})
