import { useState } from "react"
import { IoSearch } from "react-icons/io5"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import Suggestions from "../home/Suggestions"
import { useExplore } from "@/store/useExplore"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import Masonry from "react-responsive-masonry"
import MediaSkeleton from "@/components/layout/MediaSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import EvenSkeletonCard from "@/components/layout/EvenSkeletonCard"
import OddSkeletonCard from "@/components/layout/OddSkeletonCard"
import ImageItem from "@/components/media/ImageItem"

const CollectionDetailPage = () => {
    const { collectionId } = useParams()
    const recommendedCollections = useExplore(state => state.recommendedCollections)
    const collection = recommendedCollections.find(c => c.id === collectionId)
    const [hasMore, setHasMore] = useState(true)

    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!searchQuery) return null

        navigate(`/search?query=${searchQuery}&type=photos`)
    }

    const getCollection = async ({ pageParam = 1 }) => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/search?query=${collection?.title}&per_page=40&page=${pageParam}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )

            const photos = res.data.photos

            if (pageParam === 5 || photos.length === 0) setHasMore(false)

            return { data: photos, nextPage: pageParam + 1 }
        } catch (err) {
            console.log(err)
            return { data: [], nextPage: undefined }
        }
    }

    const { data, isPending, isLoading, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ['collection', collectionId],
        queryFn: getCollection,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1
    })

    const photos = data?.pages.flatMap(p => p.data)

    if (!collection) return <Navigate to='/explore' replace />

    return (
        <div className="relative bg-[#fdfcfb] min-h-screen px-[18px] pb-[24px] pt-[150px]">
            <div className="fixed top-0 right-0 left-[80px] bg-[#fdfcfb] z-10 m-auto px-5 pt-5 border-b border-black/10">
                <form
                    onSubmit={onSearchMedia}
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

                <Suggestions />
            </div>

            <section>
                <div
                    className="relative h-[300px] w-[700px] mx-auto mb-[36px] rounded-4xl bg-cover bg-center overflow-hidden"
                    style={{
                        backgroundImage: `url(${collection.backgroundImage})`
                    }}
                >
                    <div
                        className="absolute z-1 h-full w-full bg-black/30 flex flex-col justify-end items-center text-white p-[28px]"
                    >
                        <h1
                            className="font-bold text-[42px]"
                        >
                            {collection.title}
                        </h1>

                        <p className="mt-[-8px] text-lg">{collection.description}</p>
                    </div>
                </div>

                {isPending || isLoading
                    ? <MediaSkeleton />
                    : photos
                        ? (
                            <InfiniteScroll
                                dataLength={photos.length}
                                next={fetchNextPage}
                                hasMore={hasMore}
                                loader={<div></div>}
                            >
                                <Masonry columnsCount={5} gutter="16px">
                                    {photos.map((img) => {
                                        if (!img?.src?.large) return null

                                        if (img.height <= img.width) return null

                                        return <ImageItem image={img} />
                                    })}

                                    {isFetchingNextPage
                                        ? Array.from({ length: 20 }).map((_, i) => {
                                            if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                                            return <OddSkeletonCard key={i} />
                                        })
                                        : null
                                    }
                                </Masonry>
                            </InfiniteScroll>
                        ) : null
                }
            </section>
        </div>
    )
}

export default CollectionDetailPage