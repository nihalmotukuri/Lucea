import { useInfiniteQuery } from "@tanstack/react-query"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import VideoItem from '@/components/media/VideoItem'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'
import ImageItem from '@/components/media/ImageItem'
import QueryFeedback from '@/components/features/QueryFeedback'
import { fetchCuratedPhotos, fetchPopularVideos } from '@/api/pexels'
import { MASONRY_COLUMNS, MASONRY_GUTTER, VIDEO_MASONRY_COLUMNS } from '@/lib/masonry'

type MediaFilter = "all" | "photos" | "videos"

interface MediaProps {
    filter: MediaFilter
}

const Media = ({ filter }: MediaProps) => {
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

    const allMedia = data?.pages.flatMap(pg => pg.data) ?? []
    const mediaList = filter === "all"
        ? allMedia
        : allMedia.filter(media => filter === "photos" ? "src" in media : "video_files" in media)
    const columnsCountBreakPoints = filter === "videos" ? VIDEO_MASONRY_COLUMNS : MASONRY_COLUMNS

    if (isPending && !isError) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={columnsCountBreakPoints}>
                <Masonry gutter={MASONRY_GUTTER} sequential>
                    {Array.from({ length: 12 }).map((_, index) =>
                        index % 2 === 0
                            ? <EvenSkeletonCard key={index} />
                            : <OddSkeletonCard key={index} />
                    )}
                </Masonry>
            </ResponsiveMasonry>
        )
    }

    if (mediaList.length === 0) {
        return <QueryFeedback error={error} empty={!isError} isRetrying={isFetching} onRetry={() => void refetch()} />
    }

    return (
        <>
        <InfiniteScroll
            dataLength={mediaList.length}
            hasMore={!!data?.pages.at(-1)?.nextPage}
            next={fetchNextPage}
            loader={<div></div>}
        >
            <ResponsiveMasonry columnsCountBreakPoints={columnsCountBreakPoints}>
                <Masonry gutter={MASONRY_GUTTER} sequential>
                    {mediaList.map((media) => {

                        if ("src" in media) {
                            if (!media?.src?.large) return null

                            return <ImageItem image={media} key={media.id} />
                        }

                        if (!("video_files" in media)) return null

                        return <VideoItem key={media.id} video={media} />
                    })}

                    {isFetchingNextPage
                        ? Array.from({ length: 8 }).map((_, i) => {
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

export default Media