import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { LineSpinner } from 'ldrs/react';
import 'ldrs/react/LineSpinner.css';
import MediaSkeleton from "@/components/layout/MediaSkeleton";
import ImageItem from "@/components/media/ImageItem";
import EvenSkeletonCard from "@/components/layout/EvenSkeletonCard";
import OddSkeletonCard from "@/components/layout/OddSkeletonCard";
import Suggestions from "../home/Suggestions";
import { IoSearch } from "react-icons/io5";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Photo } from "@/types/types";

const urlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            if (typeof reader.result === "string") {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to convert blob to base64 string"));
            }
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting URL to Base64:", error);
        throw error;
    }
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const PhotoDetailPage = () => {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!searchQuery) return null

        navigate(`/search?query=${searchQuery}&type=photos`)
    }

    const { photoId } = useParams();
    const [hasMore, setHasMore] = useState(true);

    const getPhoto = async () => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/photos/${photoId}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            )
            console.log(res.data)
            return res.data
        } catch (err) {
            console.error(err)
            return null
        }
    };

    const getRelatedKeyword = async (photo: Photo): Promise<{ keyword: string } | ""> => {
        if (!photo?.src?.medium) return "";

        try {
            const base64Image = await urlToBase64(photo.src.original);

            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
                systemInstruction: `
                        You are an AI-powered creative search assistant. 
                        Analyze the provided image and return a single, concise, descriptive keyword 
                        that best represents its core essence or subject matter.
                        Return ONLY a valid JSON object with a single key "keyword".
                    `
            });

            const result = await model.generateContent([
                { text: "Generate a search keyword for this image." },
                { inlineData: { mimeType: "image/jpeg", data: base64Image } }
            ]);

            const text = await result.response.text();
            return JSON.parse(text);
        } catch (err) {
            console.error("Error getting related keyword from Gemini:", err);
            return "";
        }
    }

    const { data: photo, isPending: isPhotoPending } = useQuery({
        queryKey: ["photo", photoId],
        queryFn: getPhoto
    });

    const { data: keywordData } = useQuery({
        queryKey: ["relatedKeyword", photoId],
        queryFn: () => getRelatedKeyword(photo),
        enabled: !!photo,
        staleTime: Infinity,
    });

    const keyword = typeof keywordData === "object" && keywordData !== null ? keywordData.keyword : "";

    const getRelatedImages = async ({ pageParam = 1 }) => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/search?query=${keyword}&per_page=12&page=${pageParam}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY,
                    },
                }
            )
            const photos = res.data.photos
            if (photos.length === 0) setHasMore(false)
            return { data: photos, nextPage: pageParam + 1 }
        } catch (err) {
            console.error(err)
            return { data: [], nextPage: undefined }
        }
    };

    const {
        data: relatedPhotos,
        fetchNextPage,
        isFetchingNextPage,
        isPending: isRelatedPhotosPending,
        isLoading: isRelatedPhotosLoading
    } = useInfiniteQuery({
        queryKey: ["relatedImages", keyword],
        queryFn: getRelatedImages,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: !!keyword,
    });

    const imageList = relatedPhotos?.pages.flatMap(p => p.data);

    return (
        <div className="relative bg-[#fdfcfb] px-[18px] pb-[24px] pt-[140px]">
            <div className="fixed top-0 right-0 left-[80px] bg-[#fdfcfb] z-10 m-auto px-5 pt-5 border-b border-black/10">
                <form
                    onSubmit={onSearchMedia}
                    className="relative h-[50px] w-full p-[16px] rounded-2xl flex items-center border border-black/10"
                >
                    <input
                        className="text-md w-full border-none outline-none"
                        type="text"
                        placeholder="Discover photos & videos"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="pl-2 text-xl text-black/50 cursor-pointer"
                    >
                        <IoSearch />
                    </button>
                </form>

                <Suggestions />
            </div>

            <div
                className="bg-white rounded-4xl h-full"
            >
                {isPhotoPending
                    ? (
                        <div className="h-[540px] flex items-center justify-center">
                            <LineSpinner
                                size="40"
                                stroke="3"
                                speed="1"
                                color="#b8bfad"
                            />
                        </div>
                    ) : null}

                {photo && (
                    <img
                        src={photo?.src?.large2x || photo?.src?.large || photo?.src?.original}
                        className="m-auto rounded-3xl h-[540px] max-w-[1046px] object-cover"
                        style={{
                            backgroundColor: photo.avg_color
                        }}
                    />
                )}

                <section className="mt-[54px]">
                    <h1 className="text-3xl mb-[24px]">Related Photos</h1>

                    {(isRelatedPhotosPending || isRelatedPhotosLoading || !keyword) && <MediaSkeleton />}

                    {imageList &&
                        <InfiniteScroll
                            dataLength={imageList.length}
                            hasMore={hasMore}
                            next={fetchNextPage}
                            loader={<div></div>}
                        >
                            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 5 }}>
                                <Masonry>
                                    {relatedPhotos && imageList.map((img) => {
                                        if (!img?.src?.large) return null
                                        return <ImageItem image={img} key={img.id} />
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
                    }
                </section>
            </div>
        </div>
    )
}

export default PhotoDetailPage