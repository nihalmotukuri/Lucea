import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import ImageItem from '@/components/media/ImageItem'
import QueryFeedback from '@/components/features/QueryFeedback'
import { fetchCuratedPhotos } from '@/api/pexels'

const OddSkeletonCard = () => (
    <div className="m-[4px] rounded-2xl w-full bg-[#e7e7e2] animate-pulse h-[460px]" />
)

const EvenSkeletonCard = () => (
    <div className="m-[4px] rounded-2xl w-full bg-[#e7e7e2] animate-pulse h-[360px]" />
)

const Images = () => {
    const { data, fetchNextPage, isFetchingNextPage, isPending, isError, error, refetch } = useInfiniteQuery({
        queryKey: ["home", "photos"],
        queryFn: ({ pageParam, signal }) => fetchCuratedPhotos(pageParam, 20, signal),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    })

    const imageList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending && !isError) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                <Masonry sequential>
                    {Array.from({ length: 12 }).map((_, i) =>
                        i % 2 === 0 ? <EvenSkeletonCard key={i} /> : <OddSkeletonCard key={i} />
                    )}
                </Masonry>
            </ResponsiveMasonry>
        )
    }

    if (imageList.length === 0) {
        return <QueryFeedback error={error} empty={!isError} onRetry={() => void refetch()} />
    }

    return (
        <>
        <InfiniteScroll
            dataLength={imageList.length}
            hasMore={!!data?.pages.at(-1)?.nextPage}
            next={fetchNextPage}
            loader={<div />}
        >
            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                <Masonry sequential>
                    {imageList.map((img) => {
                        if (!img?.src?.large) return null
                        return <ImageItem image={img} key={img.id} />
                    })}

                    {isFetchingNextPage &&
                        Array.from({ length: 20 }).map((_, i) =>
                            i % 2 === 0 ? <EvenSkeletonCard key={i} /> : <OddSkeletonCard key={i} />
                        )
                    }
                </Masonry>
            </ResponsiveMasonry>
        </InfiniteScroll>
        {isError && <QueryFeedback error={error} onRetry={() => void refetch()} />}
        </>
    )
}

export default Images
