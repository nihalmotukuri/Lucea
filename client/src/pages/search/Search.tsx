import { useEffect, useState } from "react"
import { useSearchParams, Navigate } from "react-router-dom"
import { IoSearch } from "react-icons/io5"
import ImageSearch from "./ImageSearch"
import VideoSearch from "./VideoSearch"
import SearchRecommendations from "./SearchRecommendations"
import type { MediaOrientation } from "@/api/pexels"
import type { MediaSortOrder } from "@/lib/media"

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('query')?.trim() || null
  const mediaType = searchParams.get('type') === 'videos' ? 'videos' : 'photos'
  const requestedOrientation = searchParams.get('orientation')
  const orientation: MediaOrientation | "all" =
    requestedOrientation === "landscape" || requestedOrientation === "portrait" || requestedOrientation === "square"
      ? requestedOrientation
      : "all"
  const requestedSort = searchParams.get('sort')
  const sortOrder: MediaSortOrder =
    requestedSort === "largest" || requestedSort === "smallest" ? requestedSort : "relevance"

  const [searchQuery, setSearchQuery] = useState(urlQuery || '')

  useEffect(() => {
    setSearchQuery(urlQuery || '')
  }, [urlQuery])

  if (!urlQuery) return <Navigate to='/' replace />

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("query", query)
    nextParams.set("type", mediaType)
    setSearchParams(nextParams)
  }

  const updateFilters = (updates: { orientation?: string; sort?: string }) => {
    const nextParams = new URLSearchParams(searchParams)
    if (updates.orientation !== undefined) {
      if (updates.orientation === "all") nextParams.delete("orientation")
      else nextParams.set("orientation", updates.orientation)
    }
    if (updates.sort !== undefined) {
      if (updates.sort === "relevance") nextParams.delete("sort")
      else nextParams.set("sort", updates.sort)
    }
    setSearchParams(nextParams)
  }

  return (
    <div className="relative min-h-screen bg-[#fdfcfb] px-3 pb-6 pt-[140px] sm:px-[18px]">
      <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb] px-4 pt-4 md:left-[80px] md:px-5 md:pt-5">
        <form
          onSubmit={onSearch}
          className="relative h-[50px] w-full p-[16px] rounded-2xl flex items-center border border-black/10"
        >
          <input
            aria-label="Search photos and videos"
            className="text-md w-full border-none outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
            type="text"
            placeholder="Discover photos & videos"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <button
            type="submit"
            aria-label="Search"
            className="pl-2 text-xl text-black/50 cursor-pointer"
          >
            <IoSearch />
          </button>
        </form>

        <SearchRecommendations urlQuery={urlQuery} />
      </div>

      <section aria-label="Search results controls" className="mb-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1
              className="break-words text-xl text-neutral-800 sm:text-2xl"
              style={{ fontFamily: '"PT Serif", serif' }}
            >
              Results for <span className="font-semibold">{urlQuery}</span>
            </h1>
            <p className="mt-1 text-xs text-neutral-500">Filter by orientation; size sorting applies to loaded results.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end sm:gap-4">
            <div role="group" aria-label="Media type" className="col-span-2 inline-flex w-fit rounded-xl bg-black/[0.04] p-1 sm:col-span-1">
              {(["photos", "videos"] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={mediaType === type}
                  onClick={() => {
                    const nextParams = new URLSearchParams(searchParams)
                    nextParams.set("type", type)
                    setSearchParams(nextParams)
                  }}
                  className={`${mediaType === type ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"} min-h-10 rounded-lg px-3 text-sm font-medium capitalize transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700`}
                >
                  {type === "photos" ? "Photos" : "Videos"}
                </button>
              ))}
            </div>

            <span className="hidden h-7 w-px bg-black/10 sm:block" aria-hidden="true" />

            <label className="flex min-w-0 items-center gap-2 text-sm text-neutral-600">
              <span className="sr-only">Orientation</span>
              <select
                aria-label="Filter by orientation"
                className="min-h-10 w-full max-w-[9.5rem] rounded-xl border border-black/10 bg-[#fdfcfb] px-3 text-sm text-neutral-800 outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-neutral-500"
                value={orientation}
                onChange={event => updateFilters({ orientation: event.target.value })}
              >
                <option value="all">Any orientation</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
            </label>

            <label className="flex min-w-0 items-center gap-2 text-sm text-neutral-600">
              <span className="sr-only">Sort results</span>
              <select
                aria-label="Sort search results"
                className="min-h-10 w-full max-w-[9.5rem] rounded-xl border border-black/10 bg-[#fdfcfb] px-3 text-sm text-neutral-800 outline-none transition hover:border-black/20 focus-visible:ring-2 focus-visible:ring-neutral-500"
                value={sortOrder}
                onChange={event => updateFilters({ sort: event.target.value })}
              >
                <option value="relevance">Most relevant</option>
                <option value="largest">Largest first</option>
                <option value="smallest">Smallest first</option>
              </select>
            </label>
          </div>
        </div>

        {(orientation !== "all" || sortOrder !== "relevance") && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3">
            <span className="mr-1 text-xs text-neutral-500">Active filters</span>
            {orientation !== "all" && (
              <button
                type="button"
                onClick={() => updateFilters({ orientation: "all" })}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-neutral-900 px-3 text-xs font-medium capitalize text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                aria-label={`Remove ${orientation} orientation filter`}
              >
                {orientation}<span aria-hidden="true">×</span>
              </button>
            )}
            {sortOrder !== "relevance" && (
              <button
                type="button"
                onClick={() => updateFilters({ sort: "relevance" })}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                aria-label={`Remove ${sortOrder === "largest" ? "largest first" : "smallest first"} sort`}
              >
                {sortOrder === "largest" ? "Largest first" : "Smallest first"}<span aria-hidden="true">×</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => updateFilters({ orientation: "all", sort: "relevance" })}
              className="ml-auto min-h-8 px-2 text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {mediaType === 'videos'
        ? <VideoSearch searchQuery={urlQuery} orientation={orientation} sortOrder={sortOrder} />
        : <ImageSearch searchQuery={urlQuery} orientation={orientation} sortOrder={sortOrder} />
      }
    </div>
  )
}

export default Search
