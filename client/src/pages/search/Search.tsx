import { useEffect, useState } from "react"
import { useSearchParams, Navigate } from "react-router-dom"
import ImageSearch from "./ImageSearch"
import VideoSearch from "./VideoSearch"
import SearchRecommendations from "./SearchRecommendations"
import type { MediaOrientation } from "@/api/pexels"
import type { MediaSortOrder } from "@/lib/media"
import SearchBar from "@/components/features/SearchBar"
import { ArrowDownWideNarrow, ChevronDown, Crop } from "lucide-react"

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
        <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearch} />

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

            <label className="relative flex min-w-0 items-center gap-2 rounded-2xl border border-black/[0.07] bg-[#faf8f4] p-2.5 transition hover:border-black/[0.14] focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-900/[0.04]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-neutral-500 shadow-sm">
                <Crop size={16} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Shape</span>
              <select
                aria-label="Filter by orientation"
                className="min-h-6 w-full min-w-0 appearance-none border-0 bg-transparent pr-5 text-sm font-medium text-neutral-800 outline-none"
                value={orientation}
                onChange={event => updateFilters({ orientation: event.target.value })}
              >
                <option value="all">Any shape</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
              </span>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} aria-hidden="true" />
            </label>

            <label className="relative flex min-w-0 items-center gap-2 rounded-2xl border border-black/[0.07] bg-[#faf8f4] p-2.5 transition hover:border-black/[0.14] focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-900/[0.04]">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-neutral-500 shadow-sm">
                <ArrowDownWideNarrow size={16} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Order</span>
              <select
                aria-label="Sort search results"
                className="min-h-6 w-full min-w-0 appearance-none border-0 bg-transparent pr-5 text-sm font-medium text-neutral-800 outline-none"
                value={sortOrder}
                onChange={event => updateFilters({ sort: event.target.value })}
              >
                <option value="relevance">Most relevant</option>
                <option value="largest">Largest first</option>
                <option value="smallest">Smallest first</option>
              </select>
              </span>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} aria-hidden="true" />
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
