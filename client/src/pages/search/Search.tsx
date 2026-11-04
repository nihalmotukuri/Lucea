import { useEffect, useState } from "react"
import { useSearchParams, Navigate } from "react-router-dom"
import ImageSearch from "./ImageSearch"
import VideoSearch from "./VideoSearch"
import type { MediaOrientation } from "@/api/pexels"
import type { MediaSortOrder } from "@/lib/media"
import SearchBar from "@/components/features/SearchBar"
import SearchFilterDropdown from "@/components/features/SearchFilterDropdown"
import type { SearchFilterOption } from "@/components/features/SearchFilterDropdown"
import { ArrowDownWideNarrow, ArrowUpNarrowWide, RectangleHorizontal, RectangleVertical, Sparkles, Square } from "lucide-react"
import Suggestions from "@/pages/home/Suggestions"

const orientationOptions: SearchFilterOption[] = [
  { value: "all", label: "Any shape", description: "Show every orientation", icon: Square },
  { value: "landscape", label: "Landscape", description: "Wide, horizontal frames", icon: RectangleHorizontal },
  { value: "portrait", label: "Portrait", description: "Tall, vertical frames", icon: RectangleVertical },
  { value: "square", label: "Square", description: "Balanced, equal sides", icon: Square },
]

const sortOptions: SearchFilterOption[] = [
  { value: "relevance", label: "Most relevant", description: "Best match for your search", icon: Sparkles },
  { value: "largest", label: "Largest first", description: "Highest resolution first", icon: ArrowDownWideNarrow },
  { value: "smallest", label: "Smallest first", description: "Lowest resolution first", icon: ArrowUpNarrowWide },
]

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

  const onSearch = (searchTerm: string) => {
    const query = searchTerm.trim()
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

        <Suggestions />
      </div>

      <section aria-label="Search results controls" className="mb-5 border-b border-black/[0.08] pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Search results</p>
            <h1
              className="font-editorial break-words text-[26px] leading-tight text-neutral-800 sm:text-[32px]"
            >
              {urlQuery}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
            <div role="group" aria-label="Media type" className="flex items-center gap-3 border-r border-black/[0.08] pr-4">
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
                  className={`${mediaType === type ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900"} min-h-9 border-b text-sm font-medium capitalize transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700`}
                >
                  {type === "photos" ? "Photos" : "Videos"}
                </button>
              ))}
            </div>

            <SearchFilterDropdown
              label="Shape"
              value={orientation}
              options={orientationOptions}
              onChange={value => updateFilters({ orientation: value })}
            />
            <SearchFilterDropdown
              label="Order"
              value={sortOrder}
              options={sortOptions}
              onChange={value => updateFilters({ sort: value })}
            />
          </div>
        </div>

        {(orientation !== "all" || sortOrder !== "relevance") && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {orientation !== "all" && (
              <button
                type="button"
                onClick={() => updateFilters({ orientation: "all" })}
                className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-black/[0.09] px-2.5 text-[11px] font-medium capitalize text-neutral-600 transition hover:border-black/20 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                aria-label={`Remove ${orientation} orientation filter`}
              >
                {orientation}<span aria-hidden="true">×</span>
              </button>
            )}
            {sortOrder !== "relevance" && (
              <button
                type="button"
                onClick={() => updateFilters({ sort: "relevance" })}
                className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-black/[0.09] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-black/20 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
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
