// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import Suggestions from "./Suggestions"
import { DEFAULT_TOPICS, useTopic } from "@/store/useTopic"

vi.mock("@/hooks/useDailyTopics", () => ({
    default: () => ({ isError: false, topicsReady: true }),
}))
vi.mock("@/components/features/HorizontalScroller", () => ({
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

afterEach(() => {
    cleanup()
    useTopic.setState({ topics: [] })
})

describe("Suggestions", () => {
    it("highlights the topic selected by the current route", () => {
        useTopic.setState({ topics: DEFAULT_TOPICS })

        render(
            <MemoryRouter initialEntries={["/t/travel"]}>
                <Routes>
                    <Route path="/t/:topicSlug" element={<Suggestions />} />
                </Routes>
            </MemoryRouter>,
        )

        expect(screen.getByRole("link", { name: "Travel" }).getAttribute("aria-current")).toBe("page")
        expect(screen.getByRole("link", { name: "Nature" }).getAttribute("aria-current")).toBeNull()
    })
})
