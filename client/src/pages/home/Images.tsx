import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import ImageItem from '@/components/media/ImageItem'
import QueryFeedback from '@/components/features/QueryFeedback'
import { fetchCuratedPhotos } from '@/api/pexels'
import { MASONRY_COLUMNS, MASONRY_GUTTER } from '@/lib/masonry'

const OddSkeletonCard = () => (
    <div className="w-full animate-pulse rounded-2xl bg-[#e7e7e2] aspect-[3/4]" />
)

const EvenSkeletonCard = () => (
    <div className="w-full animate-pulse rounded-2xl bg-[#e7e7e2] aspect-[4/5]" />
)

const Images = () => {
    const { data, fetchNextPage, isFetchingNextPage, isFetching, isPending, isError, error, refetch } = useInfiniteQuery({
        queryKey: ["home", "photos"],
        queryFn: ({ pageParam, signal }) => fetchCuratedPhotos(pageParam, 20, signal),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    })

    const imageList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending && !isError) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={MASONRY_COLUMNS}>
                <Masonry gutter={MASONRY_GUTTER} sequential>
                    {Array.from({ length: 12 }).map((_, i) =>
                        i % 2 === 0 ? <EvenSkeletonCard key={i} /> : <OddSkeletonCard key={i} />
                    )}
                </Masonry>
            </ResponsiveMasonry>
        )
    }

    if (imageList.length === 0) {
        return <QueryFeedback error={error} empty={!isError} isRetrying={isFetching} onRetry={() => void refetch()} />
    }

    return (
        <>
        <InfiniteScroll
            dataLength={imageList.length}
            hasMore={!!data?.pages.at(-1)?.nextPage}
            next={fetchNextPage}
            loader={<div />}
        >
            <ResponsiveMasonry columnsCountBreakPoints={MASONRY_COLUMNS}>
                <Masonry gutter={MASONRY_GUTTER} sequential>
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
        {isError && <QueryFeedback error={error} isRetrying={isFetching} onRetry={() => void refetch()} />}
        </>
    )
}

export default Images
