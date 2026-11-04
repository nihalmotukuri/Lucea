import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import VideoItem from '../../components/media/VideoItem'
import QueryFeedback from '@/components/features/QueryFeedback'
import { fetchPopularVideos } from '@/api/pexels'
import { MASONRY_GUTTER, VIDEO_MASONRY_COLUMNS } from '@/lib/masonry'

const OddSkeletonCard = () => <div className="w-full animate-pulse rounded-2xl bg-[#e7e7e2] aspect-[3/4]" />

const EvenSkeletonCard = () => <div className="w-full animate-pulse rounded-2xl bg-[#e7e7e2] aspect-[4/5]" />

const Videos = () => {
    const { data, fetchNextPage, isFetchingNextPage, isFetching, isPending, isError, error, refetch } = useInfiniteQuery({
        queryKey: ["home", "videos"],
        queryFn: ({ pageParam, signal }) => fetchPopularVideos(pageParam, 12, signal),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    const videoList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending && !isError) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={VIDEO_MASONRY_COLUMNS}>
                <Masonry gutter={MASONRY_GUTTER} sequential>
                    {Array.from({ length: 12 }).map((_, i) => {
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

export default Videos