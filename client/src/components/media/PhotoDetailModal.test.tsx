// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import PhotoDetailModal from "./PhotoDetailModal"

vi.mock("@/api/pexels", () => ({
    getPhoto: vi.fn(async (id: string) => ({
        id: Number(id),
        width: 100,
        height: 100,
        url: "",
        photographer: "Photographer",
        photographer_url: "",
        photographer_id: 1,
        avg_color: "",
        src: {
            original: "",
            large2x: "",
            large: "",
            medium: "",
            small: "",
            portrait: "",
            landscape: "",
            tiny: "",
        },
        alt: "A photo",
    })),
}))

vi.mock("@/components/media/MediaDetailView", () => ({
    default: ({
        item,
        onBack,
        onClose,
    }: {
        item: { media: { id: number } }
        onBack: () => void
        onClose: () => void
    }) => (
        <div>
            <p>Photo {item.media.id}</p>
            <button type="button" onClick={onBack}>Back</button>
            <button type="button" onClick={onClose}>Close</button>
        </div>
    ),
}))

const CurrentPath = () => {
    const location = useLocation()
    return <p data-testid="current-path">{location.pathname}</p>
}

afterEach(cleanup)

describe("photo detail modal navigation", () => {
    it("returns to the previous modal with Back and dismisses to the original page with Close", async () => {
        const queryClient = new QueryClient()
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter
                    initialEntries={[
                        "/",
                        { pathname: "/photos/1", state: { photoBackgroundLocation: { pathname: "/" } } },
                        { pathname: "/photos/2", state: { photoBackgroundLocation: { pathname: "/" } } },
                    ]}
                    initialIndex={2}
                >
                    <CurrentPath />
                    <Routes>
                        <Route path="/" element={<p>Home page</p>} />
                        <Route path="/photos/:photoId" element={<PhotoDetailModal />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>,
        )

        await screen.findByText("Photo 2")
        fireEvent.click(screen.getByRole("button", { name: "Back" }))
        await waitFor(() => expect(screen.getByTestId("current-path").textContent).toBe("/photos/1"))
        await screen.findByText("Photo 1")

        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        await waitFor(() => expect(screen.getByTestId("current-path").textContent).toBe("/"))
        expect(screen.getByText("Home page")).toBeTruthy()
        queryClient.clear()
    })
})
