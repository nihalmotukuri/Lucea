// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import type { ReactNode } from "react"
import { waitFor } from "@testing-library/react"
import RelatedMoodboards from "./RelatedMoodboards"
import { getSearchRecommendations } from "@/api/gemini"
import PublicMoodboardCard from "@/components/features/PublicMoodboardCard"
import SearchBar from "@/components/features/SearchBar"
import { searchPublicMoodboards } from "@/api/moodboards"
import type { PublicMoodboardSummary } from "@/types/types"

const { moodboard }: { moodboard: PublicMoodboardSummary } = vi.hoisted(() => ({
    moodboard: {
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
    },
}))

vi.mock("@/api/moodboards", () => ({
    searchPublicMoodboards: vi.fn().mockResolvedValue([moodboard]),
}))

vi.mock("@/api/gemini", () => ({
    getSearchRecommendations: vi.fn().mockResolvedValue(["cozy room"]),
}))

vi.mock("@/components/features/HorizontalScroller", () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

afterEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.mocked(getSearchRecommendations).mockReset().mockResolvedValue(["cozy room"])
})

describe("RelatedMoodboards", () => {
    it("shows loading instead of fallback recommendations while the API request is pending", async () => {
        let resolveRecommendations!: (recommendations: string[]) => void
        vi.mocked(getSearchRecommendations).mockReturnValueOnce(
            new Promise(resolve => {
                resolveRecommendations = resolve
            }),
        )
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SearchBar value="interiors" onChange={vi.fn()} onSubmit={vi.fn()} showRelatedSearches />
                </MemoryRouter>
            </QueryClientProvider>,
        )

        fireEvent.focus(screen.getByRole("textbox", { name: "Search photos and videos" }))

        const loadingText = await screen.findByText("Loading recommendations…")
        const loadingStatus = loadingText.closest('[role="status"]')
        expect(loadingStatus).not.toBeNull()
        expect(loadingStatus?.querySelector('[aria-hidden="true"]')?.className).toContain("size-3")
        expect(screen.queryByRole("link", { name: "interiors photography" })).toBeNull()
        resolveRecommendations(["warm interiors"])
        expect(await screen.findByRole("link", { name: "warm interiors" })).toBeTruthy()
        queryClient.clear()
    })

    it("uses the same compact loader for related moodboards", async () => {
        let resolveMoodboards!: (boards: PublicMoodboardSummary[]) => void
        vi.mocked(searchPublicMoodboards).mockReturnValueOnce(
            new Promise(resolve => {
                resolveMoodboards = resolve
            }),
        )
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RelatedMoodboards query="interiors" />
                </MemoryRouter>
            </QueryClientProvider>,
        )

        const loadingText = await screen.findByText("Finding matching boards…")
        const loadingStatus = loadingText.closest('[role="status"]')
        expect(loadingStatus).not.toBeNull()
        expect(loadingStatus?.querySelector('[aria-hidden="true"]')?.className).toContain("size-3")
        resolveMoodboards([])
        queryClient.clear()
    })

    it("shows fallback recommendations only after the API request fails", async () => {
        const requestError = new Error("Recommendation request failed")
        vi.mocked(getSearchRecommendations)
            .mockRejectedValueOnce(requestError)
            .mockRejectedValueOnce(requestError)
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SearchBar value="interiors" onChange={vi.fn()} onSubmit={vi.fn()} showRelatedSearches />
                </MemoryRouter>
            </QueryClientProvider>,
        )

        fireEvent.focus(screen.getByRole("textbox", { name: "Search photos and videos" }))

        expect(await screen.findByText("Showing quick ideas", {}, { timeout: 3000 })).toBeTruthy()
        expect(screen.getByRole("link", { name: "interiors photography" })).toBeTruthy()
        expect(screen.getByText("Showing quick ideas")).toBeTruthy()
        queryClient.clear()
    })

    it("shows matching public boards with a creator link", async () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RelatedMoodboards query="interiors" />
                </MemoryRouter>
            </QueryClientProvider>,
        )

        expect(await screen.findByRole("region", { name: "Community moodboard recommendations" })).toBeTruthy()
        const boardLink = await screen.findByRole("link", { name: "Warm interiors by ramesh_gupta" })
        expect(boardLink.getAttribute("href")).toBe("/profiles/ramesh_gupta/boards/11111111-1111-4111-8111-111111111111")
        expect(boardLink.textContent).toContain("by ramesh_gupta")
        queryClient.clear()
    })

    it("can omit the creator label when the profile page already identifies them", () => {
        render(
            <MemoryRouter>
                <PublicMoodboardCard moodboard={moodboard} showCreator={false} />
            </MemoryRouter>,
        )

        expect(screen.queryByRole("link", { name: "by ramesh_gupta" })).toBeNull()
        expect(screen.getByRole("link", { name: "Warm interiors, 1 saved item" })).toBeTruthy()
    })

    it("does not show boards with insufficient overlap with the search", async () => {
        vi.mocked(searchPublicMoodboards).mockResolvedValueOnce([{
            ...moodboard,
            title: "SCRAPERS",
            preview: [{ ...moodboard.preview[0], alt: "birds in flight" }],
        }])
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <RelatedMoodboards query="birds in flight" />
                </MemoryRouter>
            </QueryClientProvider>,
        )

        await waitFor(() => expect(queryClient.getQueryState(["public-moodboards", "birds in flight"])?.status).toBe("success"))
        expect(screen.queryByRole("region", { name: "Community moodboard recommendations" })).toBeNull()
        queryClient.clear()
    })

    it("shows matching boards below recent searches in the search dropdown", async () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
        window.localStorage.setItem("lucea.recentSearches", JSON.stringify(["classic cars on scenic roads"]))

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <SearchBar value="interiors" onChange={vi.fn()} onSubmit={vi.fn()} showRelatedSearches />
                </MemoryRouter>
            </QueryClientProvider>,
        )

        fireEvent.focus(screen.getByRole("textbox", { name: "Search photos and videos" }))
        expect(screen.queryByText("Search ideas")).toBeNull()
        const moodboardRecommendations = await screen.findByRole("region", { name: "Community moodboard recommendations" })
        const recentSearches = screen.getByText("Recent searches").parentElement?.parentElement
        expect(recentSearches?.parentElement?.contains(moodboardRecommendations)).toBe(true)
        const searchRecommendations = await screen.findByRole("region", { name: "Search recommendations" })
        expect(searchRecommendations.compareDocumentPosition(moodboardRecommendations) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        queryClient.clear()
    })

    it("keeps recent searches visible while entering a new query", () => {
        window.localStorage.setItem("lucea.recentSearches", JSON.stringify(["classic cars on scenic roads"]))

        render(
            <MemoryRouter>
                <SearchBar value="interiors" onChange={vi.fn()} onSubmit={vi.fn()} />
            </MemoryRouter>,
        )

        fireEvent.focus(screen.getByRole("textbox", { name: "Search photos and videos" }))

        expect(screen.getByText("Recent searches")).toBeTruthy()
        expect(screen.getByRole("button", { name: /classic cars on scenic roads/i })).toBeTruthy()
    })

    it("does not show an empty suggestions panel when there is no search history", () => {
        render(
            <MemoryRouter>
                <SearchBar value="" onChange={vi.fn()} onSubmit={vi.fn()} showRelatedSearches />
            </MemoryRouter>,
        )

        fireEvent.focus(screen.getByRole("textbox", { name: "Search photos and videos" }))

        expect(screen.queryByRole("region", { name: "Search suggestions" })).toBeNull()
    })

    it("keeps the search dropdown open when keyboard focus moves into it", () => {
        window.localStorage.setItem("lucea.recentSearches", JSON.stringify(["classic cars on scenic roads"]))

        render(
            <MemoryRouter>
                <SearchBar value="interiors" onChange={vi.fn()} onSubmit={vi.fn()} />
            </MemoryRouter>,
        )

        const input = screen.getByRole("textbox", { name: "Search photos and videos" })
        fireEvent.focus(input)
        const recentSearch = screen.getByRole("button", { name: /classic cars on scenic roads/i })
        fireEvent.blur(input, { relatedTarget: recentSearch })

        expect(screen.getByRole("region", { name: "Search suggestions" })).toBeTruthy()
    })
})
