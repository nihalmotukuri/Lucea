import { useState } from 'react'
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import ImageItem from '@/components/media/ImageItem'

const OddSkeletonCard = () => (
    <div className="m-[4px] rounded-2xl w-full bg-[#e7e7e2] animate-pulse h-[460px]" />
)

const EvenSkeletonCard = () => (
    <div className="m-[4px] rounded-2xl w-full bg-[#e7e7e2] animate-pulse h-[360px]" />
)

const Images = () => {
    const [hasMore, setHasMore] = useState(true)
    const [imageListLoading, setImageListLoading] = useState(true)

    const fetchImages = async ({ pageParam = 1 }) => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/curated?per_page=20&page=${pageParam}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )

            const photos = res.data.photos
            setImageListLoading(false)

            if (photos.length === 0) setHasMore(false)

            return { data: photos, nextPage: pageParam + 1 }
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
    })

    const imageList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending || imageListLoading) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 4 }}>
                <Masonry>
                    {Array.from({ length: 12 }).map((_, i) =>
                        i % 2 === 0 ? <EvenSkeletonCard key={i} /> : <OddSkeletonCard key={i} />
                    )}
                </Masonry>
            </ResponsiveMasonry>
        )
    }

    return (
        <InfiniteScroll
            dataLength={imageList.length}
            hasMore={hasMore}
            next={fetchNextPage}
            loader={<div />}
        >
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 4 }}>
                <Masonry>
                    {imageList.map((img) => {
                        if (!img?.src?.large) return null
                        return <ImageItem image={img} key={img.id} />
                    })}

                    {isFetchingNextPage &&
                        Array.from({ length: 20 }).map((_, i) =>
                            i % 2 === 0 ? <EvenSkeletonCard key={i} /> : <OddSkeletonCard key={i} />
                        )
                    }
                </Masonry>
            </ResponsiveMasonry>
        </InfiniteScroll>
    )
}

export default Images
