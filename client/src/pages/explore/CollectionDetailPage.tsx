import { useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import Suggestions from "../home/Suggestions"
import { useExplore } from "@/store/useExplore"
import { useInfiniteQuery } from "@tanstack/react-query"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import MediaSkeleton from "@/components/layout/MediaSkeleton"
import InfiniteScroll from "react-infinite-scroll-component"
import EvenSkeletonCard from "@/components/layout/EvenSkeletonCard"
import OddSkeletonCard from "@/components/layout/OddSkeletonCard"
import ImageItem from "@/components/media/ImageItem"
import QueryFeedback from "@/components/features/QueryFeedback"
import { searchPhotos } from "@/api/pexels"
import SearchBar from "@/components/features/SearchBar"

const CollectionDetailPage = () => {
    const { collectionId } = useParams()
    const recommendedCollections = useExplore(state => state.recommendedCollections)
    const collection = recommendedCollections.find(c => c.id === collectionId)

    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const query = searchQuery.trim()
        if (!query) return

        navigate(`/search?query=${encodeURIComponent(query)}&type=photos`)
    }

    const {
        data,
        isPending,
        fetchNextPage,
        isFetchingNextPage,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['collection', collectionId],
        queryFn: async ({ pageParam, signal }) => {
            const result = await searchPhotos(collection?.title ?? '', pageParam, 40, signal)
            return {
                ...result,
                nextPage: pageParam < 5 ? result.nextPage : undefined,
            }
        },
        getNextPageParam: lastPage => lastPage.nextPage,
        initialPageParam: 1,
        enabled: !!collection,
    })

    const photos = data?.pages.flatMap(p => p.data)

    if (!collection) return <Navigate to='/explore' replace />

    return (
        <div className="relative bg-[#fdfcfb] min-h-screen px-[18px] pb-[24px] pt-[150px]">
            <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb] px-4 pt-4 md:left-[80px] md:px-5 md:pt-5">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearchMedia} />

                <Suggestions />
            </div>

            <section>
                <div
                    className="relative mx-auto mb-8 h-[220px] w-full max-w-[700px] overflow-hidden rounded-3xl bg-cover bg-center sm:mb-[36px] sm:h-[300px] sm:rounded-4xl"
                    style={{
                        backgroundImage: `url(${collection.backgroundImage})`
                    }}
                >
                    <div
                        className="absolute z-1 h-full w-full bg-black/30 flex flex-col justify-end items-center text-white p-[28px]"
                    >
                        <h1
                            className="text-center text-3xl font-bold sm:text-[42px]"
                        >
                            {collection.title}
                        </h1>

                        <p className="mt-[-8px] text-lg">{collection.description}</p>
                    </div>
                </div>

                {isPending && !isError
                    ? <MediaSkeleton />
                    : !photos?.length
                        ? <QueryFeedback error={error} empty={!isError} onRetry={() => void refetch()} />
                    : photos
                        ? (
                            <>
                            <InfiniteScroll
                                dataLength={photos.length}
                                next={fetchNextPage}
                                hasMore={!!data?.pages.at(-1)?.nextPage}
                                loader={<div></div>}
                            >
                                <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                                <Masonry gutter="16px" sequential>
                                    {photos.map((img) => {
                                        if (!img?.src?.large) return null

                                        if (img.height <= img.width) return null

                                        return <ImageItem image={img} key={img.id} />
                                    })}

                                    {isFetchingNextPage
                                        ? Array.from({ length: 20 }).map((_, i) => {
                                            if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                                            return <OddSkeletonCard key={i} />
                                        })
                                        : null
                                    }
                                </Masonry>
                                </ResponsiveMasonry>
                            </InfiniteScroll>
                            {isError && <QueryFeedback error={error} onRetry={() => void refetch()} />}
                            </>
                        ) : null
                }
            </section>
        </div>
    )
}

export default CollectionDetailPage