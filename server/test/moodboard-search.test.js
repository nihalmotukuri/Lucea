import assert from "node:assert/strict"
import { test } from "node:test"
import { getMoodboardSearchMatch } from "../src/lib/moodboardSearch.js"

test("moodboard search rejects a board whose title is unrelated to query terms", () => {
    const result = getMoodboardSearchMatch("birds in flight", "SCRAPERS", ["birds in flight"])

    assert.equal(result.isMatch, false)
})

test("moodboard search requires multiple matching terms for multiword queries", () => {
    const result = getMoodboardSearchMatch("birds in flight", "Birds", ["birds in trees"])

    assert.equal(result.matchingTokens, 1)
    assert.equal(result.isMatch, false)
})

test("moodboard search accepts strong title and media overlap", () => {
    const result = getMoodboardSearchMatch("classic cars on scenic roads", "Classic Cars", [
        "classic cars parked on a scenic mountain road",
    ])

    assert.equal(result.isMatch, true)
})

test("moodboard search supports exact single-term title matches", () => {
    const result = getMoodboardSearchMatch("buildings", "Modern Buildings", [])

    assert.equal(result.isMatch, true)
})
