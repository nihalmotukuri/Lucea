import { useState } from 'react'
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
// import { shuffle } from 'lodash'
// import { useSearch } from '@/store/useSearch'
// import { useSearchMode } from '@/store/useSearchMode'
import OddSkeletonCard from '@/components/layout/OddSkeletonCard'
import EvenSkeletonCard from '@/components/layout/EvenSkeletonCard'
import ImageItem from '@/components/ImageItem'

const ImageSearch = ({ searchQuery }) => {
    const [hasMore, setHasMore] = useState(true)
    const [imageListLoading, setImageListLoading] = useState(true)
    // const setDeepSearching = useSearch(state => state.setDeepSearching)
    // const searchMode = useSearchMode(state => state.searchMode)

    const fetchImages = async ({ pageParam = 1 }) => {
        try {
            //     if (searchMode === 'Direct Search') {
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
            // }

            // const systemPrompt = `You are an AI creative director for a visual discovery engine. Your task is to translate a user's abstract creative brief into a list of exactly 3 distinct, concrete, and highly descriptive search keywords for an image API. The keywords should cover different aspects of the request, such as subject, mood, and style. Avoid overly generic terms. Return ONLY a valid JSON object with a single key "keywords" containing an array of 3 strings.`

            // const payload = {
            //     contents: [{ parts: [{ text: searchQuery }] }],
            //     systemInstruction: {
            //         parts: [{ text: systemPrompt }]
            //     },
            //     generationConfig: {
            //         responseMimeType: "application/json",
            //         temperature: 0.7,
            //     },
            // }

            // const geminiResponse = await axios.post(
            //     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
            //     payload,
            //     {
            //         headers: {
            //             'Content-Type': 'application/json'
            //         }
            //     }
            // )

            // const keywordsObject = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text)
            // const keywordsArray = keywordsObject.keywords
            // console.log(keywordsArray)

            // const pexelsResponse = await Promise.all(keywordsArray.map(async (kw: string) => {
            //     const res = await axios.get(
            //         `https://api.pexels.com/v1/search?query=${kw}&per_page=6&page=${pageParam}`,
            //         {
            //             headers: {
            //                 Authorization: import.meta.env.VITE_PEXELS_API_KEY
            //             }
            //         }
            //     )

            //     return res.data
            // }))

            // const photos = pexelsResponse.flatMap(res => res.photos)

            // const shuffledPhotos = shuffle(photos)

            // setImageListLoading(false)

            // if (photos.length === 0) setHasMore(false)

            // return { data: shuffledPhotos, nextPage: pageParam + 1 }
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
    });

    const imageList = data?.pages.flatMap(pg => pg.data) ?? []

    if (isPending || imageListLoading) {
        // setDeepSearching(true)

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

    // if (imageList) {
    //     setDeepSearching(false)
    // }

    return (
        <InfiniteScroll
            dataLength={imageList.length}
            hasMore={hasMore}
            next={fetchNextPage}
            loader={<div></div>}
        >
            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 5 }}>
                <Masonry>
                    {/* <div className='border border-black h-[300px] w-[500px]'></div> */}
                    {data && imageList.map((img) => {
                        if (!img?.src?.large) return null

                        return <ImageItem image={img} />
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

export default ImageSearch