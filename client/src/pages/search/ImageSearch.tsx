import { useState } from 'react'
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import ImageItem from '@/components/media/ImageItem'

interface ImageSearchProps {
    searchQuery: string
}

const ImageSearch = ({ searchQuery }: ImageSearchProps) => {
    const [hasMore, setHasMore] = useState(true)
    const [imageListLoading, setImageListLoading] = useState(true)

    const fetchImages = async ({ pageParam = 1 }) => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=20&page=${pageParam}`,
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
        queryKey: ["images", searchQuery],
        queryFn: fetchImages,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    })

    const imageList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending || imageListLoading) {
        return (
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 5 }}>
                <Masonry>
                    {Array.from({ length: 10 }).map((_, i) => {
                        if (i % 2 === 0) return <EvenSkeletonCard key={i} />
                        return <OddSkeletonCard key={i} />
                    })}
                </Masonry>
            </ResponsiveMasonry>
        )
    }

    return (
        <InfiniteScroll
            dataLength={imageList.length}
            hasMore={hasMore}
            next={fetchNextPage}
            loader={<div></div>}
        >
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 5 }}>
                <Masonry>
                    {data && imageList.map((img) => {
                        if (!img?.src?.large) return null
                        return <ImageItem key={img.id} image={img} />
                    })}

                    {isFetchingNextPage &&
                        Array.from({ length: 20 }).map((_, i) => {
                            if (i % 2 === 0) return <EvenSkeletonCard key={i} />
                            return <OddSkeletonCard key={i} />
                        })
                    }
                </Masonry>
            </ResponsiveMasonry>
        </InfiniteScroll>
    )
}

export default ImageSearch
