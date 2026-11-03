import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Photo } from "@/types/types";
import QueryFeedback from "@/components/features/QueryFeedback";
import { getPhoto, searchPhotos } from "@/api/pexels";
import SearchBar from "@/components/features/SearchBar";

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

    const onSearchMedia = (searchTerm: string) => {
        const query = searchTerm.trim()
        if (!query) return

        navigate(`/search?query=${encodeURIComponent(query)}&type=photos`)
    }

    const { photoId } = useParams();

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
            throw err;
        }
    }

    const {
        data: photo,
        isPending: isPhotoPending,
        isError: isPhotoError,
        refetch: refetchPhoto,
    } = useQuery({
        queryKey: ["photo", photoId],
        queryFn: ({ signal }) => {
            if (!photoId) throw new Error("Photo ID is required")
            return getPhoto(photoId, signal)
        },
        enabled: !!photoId,
    });

    const {
        data: keywordData,
        isPending: isKeywordPending,
        isError: isKeywordError,
        refetch: refetchKeyword,
    } = useQuery({
        queryKey: ["relatedKeyword", photoId],
        queryFn: () => {
            if (!photo) throw new Error("Photo is required to generate a related keyword")
            return getRelatedKeyword(photo)
        },
        enabled: !!photo,
        staleTime: Infinity,
    });

    const keyword = typeof keywordData === "object" && keywordData !== null ? keywordData.keyword : "";

    const {
        data: relatedPhotos,
        fetchNextPage,
        isFetchingNextPage,
        isPending: isRelatedPhotosPending,
        isError: isRelatedPhotosError,
        refetch: refetchRelatedPhotos,
    } = useInfiniteQuery({
        queryKey: ["relatedImages", keyword],
        queryFn: ({ pageParam, signal }) => searchPhotos(keyword ?? "", pageParam, 12, signal),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: !!keyword,
    });

    const imageList = relatedPhotos?.pages.flatMap(p => p.data);

    return (
        <div className="relative bg-[#fdfcfb] px-[18px] pb-[24px] pt-[140px]">
            <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb] px-4 pt-4 md:left-[80px] md:px-5 md:pt-5">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={onSearchMedia} />

                <Suggestions />
            </div>

            <div
                className="bg-white rounded-4xl h-full"
            >
                {isPhotoPending && (
                    <div className="h-[540px] flex items-center justify-center">
                        <LineSpinner size="40" stroke="3" speed="1" color="#b8bfad" />
                    </div>
                )}
                {isPhotoError && (
                    <QueryFeedback error onRetry={() => void refetchPhoto()} />
                )}
                {photo && (
                    <img
                        src={photo?.src?.large2x || photo?.src?.large || photo?.src?.original}
                        className="m-auto h-auto max-h-[60vh] max-w-full rounded-3xl object-contain sm:h-[540px] sm:max-h-[70vh] sm:max-w-[1046px]"
                        style={{ backgroundColor: photo.avg_color }}
                    />
                )}

                <section className="mt-[54px]">
                    <h1 className="text-3xl mb-[24px]">Related Photos</h1>

                    {isRelatedPhotosPending && !!keyword && <MediaSkeleton />}
                    {isKeywordError && (
                        <QueryFeedback error onRetry={() => void refetchKeyword()} />
                    )}
                    {!isKeywordPending && !isKeywordError && !keyword && (
                        <QueryFeedback empty />
                    )}
                    {imageList?.length === 0 && !isRelatedPhotosPending && !isRelatedPhotosError && (
                        <QueryFeedback empty />
                    )}
                    {imageList && imageList.length > 0 &&
                        <InfiniteScroll
                            dataLength={imageList.length}
                            hasMore={!!relatedPhotos?.pages.at(-1)?.nextPage}
                            next={fetchNextPage}
                            loader={<div></div>}
                        >
                            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                                <Masonry sequential>
                                    {imageList.map((img) => {
                                        if (!img?.src?.large) return null
                                        return <ImageItem image={img} key={img.id} />
                                    })}

                                    {isFetchingNextPage &&
                                        Array.from({ length: 12 }).map((_, i) => {
                                            if (i % 2 === 0) return <EvenSkeletonCard key={i} />
                                            return <OddSkeletonCard key={i} />
                                        })
                                    }
                                </Masonry>
                            </ResponsiveMasonry>
                        </InfiniteScroll>
                    }
                    {isRelatedPhotosError && (
                        <QueryFeedback error onRetry={() => void refetchRelatedPhotos()} />
                    )}
                </section>
            </div>
        </div>
    )
}

export default PhotoDetailPage