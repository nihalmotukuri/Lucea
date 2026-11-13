import { useEffect, useState } from "react"
import { useSearchParams, Navigate } from "react-router-dom"
import ImageSearch from "./ImageSearch"
import VideoSearch from "./VideoSearch"
import type { MediaOrientation } from "@/api/pexels"
import type { MediaSortOrder } from "@/lib/media"
import SearchBar from "@/components/features/SearchBar"
import ThemeToggle from "@/components/features/ThemeToggle"
import AccountButton from "@/components/layout/AccountButton"
import SearchFilterDropdown from "@/components/features/SearchFilterDropdown"
import type { SearchFilterOption } from "@/components/features/SearchFilterDropdown"
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Images, RectangleHorizontal, RectangleVertical, Sparkles, Square, Video } from "lucide-react"

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
    setSearchQuery(query)
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
    <div className="relative min-h-screen bg-[#fdfcfb] px-3 pb-6 sm:px-[18px] text-neutral-850 dark:bg-[#121110] dark:text-neutral-100">
      <div className="sticky top-0 z-30 -mx-3 mb-4 border-b border-black/[0.08] bg-[#fdfcfb]/95 px-3 pt-3 pb-2 backdrop-blur-sm sm:-mx-[18px] sm:px-4 sm:pt-4 md:px-5 md:pt-5 dark:border-white/[0.08] dark:bg-[#121110]/95">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex-1 min-w-0">
            <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearch} showRelatedSearches />
          </div>
          <ThemeToggle />
          <AccountButton />
        </div>
        <section aria-label="Search results controls" className="mt-2 sm:mt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 animate-subtle-reveal">
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-400 sm:text-[10px] sm:tracking-[0.16em]">Search results</p>
              <h1
                className="font-editorial break-words text-2xl leading-tight text-neutral-900 sm:text-[36px] dark:text-white tracking-[-0.01em]"
              >
                {urlQuery}
              </h1>
            </div>

            <div className="grid min-w-0 grid-cols-2 items-center gap-x-2 gap-y-1.5 sm:flex sm:w-auto sm:justify-end sm:gap-x-4 sm:gap-y-2">
              <div role="group" aria-label="Media type" className="col-span-2 flex w-fit items-center gap-1 justify-self-start rounded-full border border-black/[0.08] bg-white/80 p-1 dark:border-white/[0.08] dark:bg-[#1a1917]/80 sm:col-span-1">
                {([
                  { value: "photos", label: "Photos", Icon: Images },
                  { value: "videos", label: "Videos", Icon: Video },
                ] as const).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={mediaType === value}
                    onClick={() => {
                      const nextParams = new URLSearchParams(searchParams)
                      nextParams.set("type", value)
                      setSearchParams(nextParams)
                    }}
                    className={`inline-flex min-h-8 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[11px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 sm:gap-1.5 sm:px-3 sm:text-xs ${
                      mediaType === value
                        ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900"
                        : "text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="min-w-0">
                <SearchFilterDropdown
                  label="Shape"
                  value={orientation}
                  options={orientationOptions}
                  onChange={value => updateFilters({ orientation: value })}
                />
              </div>
              <div className="min-w-0">
                <SearchFilterDropdown
                  label="Order"
                  value={sortOrder}
                  options={sortOptions}
                  onChange={value => updateFilters({ sort: value })}
                />
              </div>
            </div>
          </div>

          {(orientation !== "all" || sortOrder !== "relevance") && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {orientation !== "all" && (
                <button
                  type="button"
                  onClick={() => updateFilters({ orientation: "all" })}
                  className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-black/[0.09] px-2.5 text-[11px] font-medium capitalize text-neutral-600 transition hover:border-black/20 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-white/10 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:text-white"
                  aria-label={`Remove ${orientation} orientation filter`}
                >
                  {orientation}<span aria-hidden="true">×</span>
                </button>
              )}
              {sortOrder !== "relevance" && (
                <button
                  type="button"
                  onClick={() => updateFilters({ sort: "relevance" })}
                  className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-black/[0.09] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-black/20 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:border-white/10 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:text-white"
                  aria-label={`Remove ${sortOrder === "largest" ? "largest first" : "smallest first"} sort`}
                >
                  {sortOrder === "largest" ? "Largest first" : "Smallest first"}<span aria-hidden="true">×</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => updateFilters({ orientation: "all", sort: "relevance" })}
                className="ml-auto min-h-8 px-2 text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 dark:text-neutral-400 dark:decoration-neutral-600 dark:hover:text-white"
              >
                Clear all
              </button>
            </div>
          )}
        </section>
      </div>

      {mediaType === 'videos'
        ? <VideoSearch searchQuery={urlQuery} orientation={orientation} sortOrder={sortOrder} />
        : <ImageSearch searchQuery={urlQuery} orientation={orientation} sortOrder={sortOrder} />
      }
    </div>
  )
}

export default Search
