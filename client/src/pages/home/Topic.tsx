import VideoItem from '@/components/media/VideoItem'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { useTopic } from '@/store/useTopic'
import ImageItem from '@/components/media/ImageItem'

const OddSkeletonCard = () => <div style={{ animationDelay: '500ms' }} className="m-[4px] rounded-3xl w-full bg-[#d9d9d5] animate-pulse h-[460px]"></div>

const EvenSkeletonCard = () => <div className="m-[4px] rounded-3xl w-full bg-[#d9d9d5] animate-pulse h-[320px]"></div>

export const Topic = ({ topicSlug }) => {
    const [hasMore, setHasMore] = useState(true)
    const [mediaListLoading, setMediaListLoading] = useState(true)
    const topics = useTopic(state => state.topics)
    const topicTitle = topics.find(t => t.slug === topicSlug)?.title

    const getTopicMedia = async ({ pageParam = 1 }) => {
        try {
            const imageRes = await axios.get(
                `https://api.pexels.com/v1/search?query=${topicTitle}&per_page=8&page=${pageParam}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )

            const videoRes = await axios.get(
                `https://api.pexels.com/videos/search?query=${topicTitle}&per_page=6&page=${pageParam}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )

            const photos = imageRes.data.photos
            const videos = videoRes.data.videos
            const media = [...photos, ...videos]

            setMediaListLoading(false)

            if (photos.length === 0 && videos.length === 0) setHasMore(false)

            return { data: media, nextPage: pageParam + 1 }
        } catch (err) {
            console.error(err)
            return { data: [], nextPage: undefined }
        }
    }

    const { data, fetchNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
        queryKey: ['topic', topicSlug],
        queryFn: getTopicMedia,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    })

    const mediaList = data?.pages.flatMap(pg => pg.data) ?? []
    console.log(mediaList)

    if (isPending || mediaListLoading) {
            return (
                <ResponsiveMasonry columnsCountBreakPoints={{ 992: 5 }}>
                    <Masonry>
                        {Array.from({ length: 10 }).map((_, i) => {
                            if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                            return <OddSkeletonCard key={i} />
                        })}
                    </Masonry>
                </ResponsiveMasonry>
            )
        }

    return (
        <section>
            <InfiniteScroll
                dataLength={mediaList.length}
                next={fetchNextPage}
                hasMore={hasMore}
                loader={<div></div>}
            >
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 5 }}>
                <Masonry>
                    {mediaList.map((media) => {

                        if (!media.duration) {
                            if (!media?.src?.large) return null

                            return <ImageItem image={media} />
                        }

                        if (!media?.video_files) return null

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
        </section>
    )
}
