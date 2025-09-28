import { useState } from 'react'
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import VideoItem from '@/components/media/VideoItem'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'

interface VideoSearchProps {
    searchQuery: string
}

const VideoSearch = ({ searchQuery }: VideoSearchProps) => {
    const [hasMore, setHasMore] = useState(true)
    const [videoListLoading, setVideoListLoading] = useState(true)

    const fetchVideos = async ({ pageParam = 1 }) => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/videos/search?query=${searchQuery}&per_page=20&page=${pageParam}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )

           const videos = res.data.videos

            setVideoListLoading(false)

            if (videos.length === 0) setHasMore(false)

            return { data: videos, nextPage: pageParam + 1 }
        } catch (err) {
            console.error(err)
            return { data: [], nextPage: undefined }
        }
    }

    const { data, fetchNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
        queryKey: ["images", searchQuery],
        queryFn: fetchVideos,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    const videoList = data?.pages.flatMap(pg => pg.data) ?? []

    console.log(videoList)

    if (isPending || videoListLoading) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 3 }}>
                <Masonry>
                    {Array.from({ length:6 }).map((_, i) => {
                        if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                        return <OddSkeletonCard key={i} />
                    })}
                </Masonry>
            </ResponsiveMasonry>
        )
    }

    return (
        <InfiniteScroll
            style={{ marginTop: '-2px' }}
            dataLength={videoList.length}
            hasMore={hasMore}
            next={fetchNextPage}
            loader={<div></div>}
        >
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 3 }}>
                <Masonry>
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
    )
}

export default VideoSearch