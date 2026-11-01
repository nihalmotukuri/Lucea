import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import VideoItem from '../../components/media/VideoItem'
import QueryFeedback from '@/components/features/QueryFeedback'
import { fetchPopularVideos } from '@/api/pexels'

const OddSkeletonCard = () => <div className="m-[4px] rounded-2xl w-full bg-[#e7e7e2] animate-pulse h-[460px]"></div>

const EvenSkeletonCard = () => <div className="m-[4px] rounded-2xl w-full bg-[#e7e7e2] animate-pulse h-[360px]"></div>

const Videos = () => {
    const { data, fetchNextPage, isFetchingNextPage, isPending, isError, error, refetch } = useInfiniteQuery({
        queryKey: ["home", "videos"],
        queryFn: ({ pageParam, signal }) => fetchPopularVideos(pageParam, 12, signal),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    const videoList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending && !isError) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                <Masonry sequential>
                    {Array.from({ length: 12 }).map((_, i) => {
                        if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                        return <OddSkeletonCard key={i} />
                    })}
                </Masonry>
            </ResponsiveMasonry>
        )
    }

    if (videoList.length === 0) {
        return <QueryFeedback error={error} empty={!isError} onRetry={() => void refetch()} />
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
            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                <Masonry sequential>
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
        {isError && <QueryFeedback error={error} onRetry={() => void refetch()} />}
        </>
    )
}

export default Videos