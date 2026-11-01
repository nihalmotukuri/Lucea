import { useEffect, useState } from "react"
import { useSearchParams, Navigate } from "react-router-dom"
import { IoSearch } from "react-icons/io5"
import ImageSearch from "./ImageSearch"
import VideoSearch from "./VideoSearch"
import SearchRecommendations from "./SearchRecommendations"

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('query')
  const mediaType = searchParams.get('type') || 'photos'

  const [searchQuery, setSearchQuery] = useState(urlQuery || '')

  useEffect(() => {
    setSearchQuery(urlQuery || '')
  }, [urlQuery])

  if (!urlQuery) return <Navigate to='/' replace />

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearchParams({ query: searchQuery, type: mediaType })
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1
          className="break-words pt-1 pb-2 text-2xl text-neutral-700 sm:pb-4 sm:text-3xl"
          style={{ fontFamily: '"PT Serif", serif' }}
        >
          Results for {urlQuery}
        </h1>

        <ul aria-label="Media type" className="flex h-[48px] gap-6">
          <li>
            <button
              type="button"
              aria-pressed={mediaType === 'photos'}
              onClick={() => setSearchParams({ query: searchQuery, type: 'photos' })}
              className={`${mediaType === 'photos' ? 'text-neutral-900 border-neutral-900' : 'text-neutral-500 border-transparent'} h-full border-b-2 pt-3 pb-1 text-lg font-medium hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700`}
            >
              Photos
            </button>
          </li>
          <li>
            <button
              type="button"
              aria-pressed={mediaType === 'videos'}
              onClick={() => setSearchParams({ query: searchQuery, type: 'videos' })}
              className={`${mediaType === 'videos' ? 'text-neutral-900 border-neutral-900' : 'text-neutral-500 border-transparent'} h-full border-b-2 pt-3 pb-1 text-lg font-medium hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700`}
            >
              Videos
            </button>
          </li>
        </ul>
      </div>

      {mediaType === 'videos'
        ? <VideoSearch searchQuery={urlQuery} />
        : <ImageSearch searchQuery={urlQuery} />
      }
    </div>
  )
}

export default Search
