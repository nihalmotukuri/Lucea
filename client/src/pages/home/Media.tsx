import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import VideoItem from '@/components/media/VideoItem'
import MediaSkeleton from '@/components/layout/MediaSkeleton'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'
import ImageItem from '@/components/media/ImageItem'
import QueryFeedback from '@/components/features/QueryFeedback'
import { fetchCuratedPhotos, fetchPopularVideos } from '@/api/pexels'

const Media = () => {
    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        isPending,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["home", "media"],
        queryFn: async ({ pageParam, signal }) => {
            const [photos, videos] = await Promise.all([
                fetchCuratedPhotos(pageParam, 8, signal),
                fetchPopularVideos(pageParam, 6, signal),
            ])
            return {
                data: [...photos.data, ...videos.data],
                nextPage: photos.nextPage ?? videos.nextPage,
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    const mediaList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending && !isError) return <MediaSkeleton />

    if (mediaList.length === 0) {
        return <QueryFeedback error={error} empty={!isError} onRetry={() => void refetch()} />
    }

    return (
        <>
        <InfiniteScroll
            dataLength={mediaList.length}
            hasMore={!!data?.pages.at(-1)?.nextPage}
            next={fetchNextPage}
            loader={<div></div>}
        >
            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                <Masonry sequential>
                    {mediaList.map((media) => {

                        if ("src" in media) {
                            if (!media?.src?.large) return null

                            return <ImageItem image={media} key={media.id} />
                        }

                        if (!("video_files" in media)) return null

                        return <VideoItem key={media.id} video={media} />
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
    )
}

export default Media