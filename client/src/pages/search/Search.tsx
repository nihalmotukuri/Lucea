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
    <div className="relative bg-[#fdfcfb] min-h-screen px-[18px] pb-[24px] pt-[140px]">
      <div className="fixed top-0 right-0 left-[80px] bg-[#fdfcfb] z-10 m-auto px-5 pt-5 border-b border-black/10">
        <form
          onSubmit={onSearch}
          className="relative h-[50px] w-full p-[16px] rounded-2xl flex items-center border border-black/10"
        >
          <input
            className="text-md w-full border-none outline-none"
            type="text"
            placeholder="Discover photos & videos"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <button
            type="submit"
            className="pl-2 text-xl text-black/50 cursor-pointer"
          >
            <IoSearch />
          </button>
        </form>

        <SearchRecommendations urlQuery={urlQuery} />
      </div>

      <div className="flex justify-between">
        <h1
          className="pt-1 pb-4 text-3xl text-neutral-700"
          style={{ fontFamily: '"PT Serif", serif' }}
        >
          Results for {urlQuery}
        </h1>

        <ul className="flex gap-6 h-[48px]">
          <li
            onClick={() => setSearchParams({ query: searchQuery, type: 'photos' })}
            className={`${mediaType === 'photos' ? 'text-neutral-900 border-neutral-900' : 'text-neutral-500 border-transparent'} border-b-2 pt-3 pb-1 text-lg cursor-pointer hover:text-neutral-900 font-medium`}
          >
            Photos
          </li>

          <li
            onClick={() => setSearchParams({ query: searchQuery, type: 'videos' })}
            className={`${mediaType === 'videos' ? 'text-neutral-900 border-neutral-900' : 'text-neutral-500 border-transparent'} border-b-2 pt-3 pb-1 text-lg cursor-pointer hover:text-neutral-900 font-medium`}
          >
            Videos
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
