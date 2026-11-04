import { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import VideoItem from '@/components/media/VideoItem'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'
import QueryFeedback from '@/components/features/QueryFeedback'
import { searchVideos, type MediaOrientation } from '@/api/pexels'
import { sortMediaBySize, type MediaSortOrder } from '@/lib/media'
import { MASONRY_GUTTER, VIDEO_MASONRY_COLUMNS } from '@/lib/masonry'

interface VideoSearchProps {
    searchQuery: string
    orientation: MediaOrientation | "all"
    sortOrder: MediaSortOrder
}

const VideoSearch = ({ searchQuery, orientation, sortOrder }: VideoSearchProps) => {
    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["search", "videos", searchQuery, orientation],
        queryFn: ({ pageParam, signal }) => searchVideos(
            searchQuery,
            pageParam,
            20,
            signal,
            orientation === "all" ? undefined : orientation,
        ),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    const videoList = useMemo(
        () => sortMediaBySize(data?.pages.flatMap(pg => pg.data) ?? [], sortOrder),
        [data, sortOrder],
    )

    if (isPending && !isError) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={VIDEO_MASONRY_COLUMNS}>
                <Masonry gutter={MASONRY_GUTTER} sequential>
                    {Array.from({ length:6 }).map((_, i) => {
                        if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                        return <OddSkeletonCard key={i} />
                    })}
                </Masonry>
            </ResponsiveMasonry>
        )
    }

    if (videoList.length === 0) {
        return <QueryFeedback error={error} empty={!isError} isRetrying={isFetching} onRetry={() => void refetch()} />
    }

    return (
        <>
        <InfiniteScroll
            style={{ marginTop: '-2px' }}
            dataLength={videoList.length}
            hasMore={!!data?.pages.at(-1)?.nextPage}
            next={fetchNextPage}
            loader={<div></div>}
        >
            <ResponsiveMasonry columnsCountBreakPoints={VIDEO_MASONRY_COLUMNS}>
                <Masonry gutter={MASONRY_GUTTER} sequential>
                    {videoList.map((video) => {
                        if (!video?.video_files) return null

                        return <VideoItem key={video.id} video={video} />
                })}
                    {isFetchingNextPage
                        ? Array.from({ length: 12 }).map((_, i) => {
                            if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                            return <OddSkeletonCard key={i} />
                        })
                        : null
                    }
                </Masonry>
            </ResponsiveMasonry>
        </InfiniteScroll>
        {isError && <QueryFeedback error={error} isRetrying={isFetching} onRetry={() => void refetch()} />}
        </>
    )
}

export default VideoSearch