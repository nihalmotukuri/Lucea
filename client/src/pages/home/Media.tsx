import { useState } from 'react'
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import VideoItem from '@/components/media/VideoItem'
import MediaSkeleton from '@/components/layout/MediaSkeleton'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'
import ImageItem from '@/components/media/ImageItem'

const Media = () => {
    const [hasMore, setHasMore] = useState(true)
    const [imageListLoading, setImageListLoading] = useState(true)

    const fetchImages = async ({ pageParam = 1 }) => {
        try {
            const imageRes = await axios.get(
                `https://api.pexels.com/v1/curated?per_page=8&page=${pageParam}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )

            const videoRes = await axios.get(
                `https://api.pexels.com/videos/popular?per_page=6&page=${pageParam}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )

            const photos = imageRes.data.photos
            const videos = videoRes.data.videos
            const media = [...photos, ...videos]

            setImageListLoading(false)

            if (photos.length === 0 && videos.length === 0) setHasMore(false)

            return { data: media, nextPage: pageParam + 1 }
        } catch (err) {
            console.error(err)
            return { data: [], nextPage: undefined }
        }
    }

    const { data, fetchNextPage, isFetchingNextPage, isPending } = useInfiniteQuery({
        queryKey: ["images"],
        queryFn: fetchImages,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });

    const mediaList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending || imageListLoading) return <MediaSkeleton />

    return (
        <InfiniteScroll
            dataLength={mediaList.length}
            hasMore={hasMore}
            next={fetchNextPage}
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
    )
}

export default Media