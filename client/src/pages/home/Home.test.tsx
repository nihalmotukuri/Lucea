// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import Home from "./Home"

vi.mock("./Media", () => ({ default: () => <div /> }))
vi.mock("./Suggestions", () => ({ default: () => <div /> }))
vi.mock("./Featured", () => ({ default: () => <div /> }))
vi.mock("./Topic", () => ({ Topic: () => <div /> }))
vi.mock("@/hooks/useDailyTopics", () => ({
    default: () => ({ topicsReady: true }),
}))

afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})

describe("Home", () => {
    it("renders without updating shared state during render", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

        render(
            <MemoryRouter initialEntries={["/"]}>
                <Home />
            </MemoryRouter>,
        )

        expect(screen.getByRole("heading", { name: "Still & Moving" })).toBeTruthy()
        expect(
            consoleError.mock.calls.flat().join(" "),
        ).not.toContain("Cannot update a component")

    })
})
