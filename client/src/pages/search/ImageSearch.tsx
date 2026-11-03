import { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import ImageItem from '@/components/media/ImageItem'
import QueryFeedback from '@/components/features/QueryFeedback'
import { searchPhotos, type MediaOrientation } from '@/api/pexels'
import { sortMediaBySize, type MediaSortOrder } from '@/lib/media'

interface ImageSearchProps {
    searchQuery: string
    orientation: MediaOrientation | "all"
    sortOrder: MediaSortOrder
}

const ImageSearch = ({ searchQuery, orientation, sortOrder }: ImageSearchProps) => {
    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        isPending,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["search", "photos", searchQuery, orientation],
        queryFn: ({ pageParam, signal }) => searchPhotos(
            searchQuery,
            pageParam,
            20,
            signal,
            orientation === "all" ? undefined : orientation,
        ),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    })

    const imageList = useMemo(
        () => sortMediaBySize(data?.pages.flatMap(pg => pg.data) ?? [], sortOrder),
        [data, sortOrder],
    )

    if (isPending && !isError) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                <Masonry sequential>
                    {Array.from({ length: 10 }).map((_, i) => {
                        if (i % 2 === 0) return <EvenSkeletonCard key={i} />
                        return <OddSkeletonCard key={i} />
                    })}
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
            loader={<div></div>}
        >
            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                <Masonry sequential>
                    {data && imageList.map((img) => {
                        if (!img?.src?.large) return null
                        return <ImageItem key={img.id} image={img} />
                    })}

                    {isFetchingNextPage &&
                        Array.from({ length: 20 }).map((_, i) => {
                            if (i % 2 === 0) return <EvenSkeletonCard key={i} />
                            return <OddSkeletonCard key={i} />
                        })
                    }
                </Masonry>
            </ResponsiveMasonry>
        </InfiniteScroll>
        {isError && <QueryFeedback error={error} onRetry={() => void refetch()} />}
        </>
    )
}

export default ImageSearch
