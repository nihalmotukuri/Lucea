import VideoItem from '@/components/media/VideoItem'
import { useInfiniteQuery } from '@tanstack/react-query'
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { useTopic } from '@/store/useTopic'
import ImageItem from '@/components/media/ImageItem'
import QueryFeedback from '@/components/features/QueryFeedback'
import { searchPhotos, searchVideos } from '@/api/pexels'

interface TopicProps {
    topicSlug: string | undefined
}

const OddSkeletonCard = () => <div style={{ animationDelay: '500ms' }} className="m-[4px] rounded-3xl w-full bg-[#d9d9d5] animate-pulse h-[460px]"></div>

const EvenSkeletonCard = () => <div className="m-[4px] rounded-3xl w-full bg-[#d9d9d5] animate-pulse h-[320px]"></div>

export const Topic = ({ topicSlug }: TopicProps) => {
    const topics = useTopic(state => state.topics)
    const topicTitle = topics.find(t => t.slug === topicSlug)?.title

    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        isPending,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['topic', topicSlug],
        queryFn: async ({ pageParam, signal }) => {
            const [photos, videos] = await Promise.all([
                searchPhotos(topicTitle ?? '', pageParam, 8, signal),
                searchVideos(topicTitle ?? '', pageParam, 6, signal),
            ])
            return {
                data: [...photos.data, ...videos.data],
                nextPage: photos.nextPage ?? videos.nextPage,
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    })

    const mediaList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending && !isError) {
            return (
                <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                    <Masonry sequential>
                        {Array.from({ length: 10 }).map((_, i) => {
                            if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                            return <OddSkeletonCard key={i} />
                        })}
                    </Masonry>
                </ResponsiveMasonry>
            )
        }

    if (mediaList.length === 0) {
        return <QueryFeedback error={error} empty={!isError} onRetry={() => void refetch()} />
    }

    return (
        <section>
            <InfiniteScroll
                dataLength={mediaList.length}
                next={fetchNextPage}
                hasMore={!!data?.pages.at(-1)?.nextPage}
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
        </section>
    )
}
