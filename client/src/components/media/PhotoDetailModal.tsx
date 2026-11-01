import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import ImageItem from "./ImageItem";
import OddSkeletonCard from "../layout/OddSkeletonCard";
import EvenSkeletonCard from "../layout/EvenSkeletonCard";
import { LineSpinner } from 'ldrs/react';
import 'ldrs/react/LineSpinner.css';
import MediaSkeleton from "../layout/MediaSkeleton";
import { HiArrowLeft } from "react-icons/hi2";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Photo } from "@/types/types";
import QueryFeedback from "@/components/features/QueryFeedback";
import { getPhoto, searchPhotos } from "@/api/pexels";

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

const PhotoDetailModal = () => {
    const navigate = useNavigate();
    const { photoId } = useParams();
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const previouslyFocused = document.activeElement
        closeButtonRef.current?.focus()
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") navigate(-1)
        }
        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.body.style.overflow = ""
            document.removeEventListener("keydown", onKeyDown)
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
        };
    }, [navigate]);

    const getRelatedKeyword = async (photo: Photo): Promise<{ keyword: string } | "">  => {
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

    const keyword = typeof keywordData === "object" && keywordData !== null ? keywordData.keyword : undefined;

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
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo details"
            className='fixed inset-0 z-50 overflow-y-auto bg-black/30 px-3 py-3 backdrop-blur-xs sm:px-8 sm:py-6 lg:px-[120px]'
        >
            <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close photo details"
                className="absolute top-5 left-5 z-10 rounded-full p-2 text-3xl text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-[32px] sm:left-[36px]"
                onClick={() => navigate(-1)}
            >
                <HiArrowLeft />
            </button>

            <div
                id="mediaDetailScrollable"
                className="relative min-h-full overflow-y-auto rounded-3xl bg-white p-4 sm:rounded-4xl sm:p-8 lg:p-[54px]"
            >
                {isPhotoPending && (
                    <div className="h-full flex items-center justify-center">
                        <LineSpinner size="40" stroke="3" speed="1" color="#b8bfad" />
                    </div>
                )}
                {isPhotoError && <QueryFeedback error onRetry={() => void refetchPhoto()} />}

                {photo && (
                    <img
                        src={photo?.src?.large2x || photo?.src?.large || photo?.src?.original}
                        className="m-auto block max-h-[60vh] max-w-full rounded-3xl object-contain sm:max-h-[75vh] sm:max-w-[1046px]"
                        style={{ backgroundColor: photo.avg_color }}
                    />
                )}

                <section className="mt-[54px]">
                    <h1 className="text-3xl mb-[24px]">Related Photos</h1>

                    {isRelatedPhotosPending && !!keyword && <MediaSkeleton />}
                    {isKeywordError && (
                        <QueryFeedback error onRetry={() => void refetchKeyword()} />
                    )}
                    {!isKeywordPending && !isKeywordError && !keyword && <QueryFeedback empty />}
                    {imageList?.length === 0 && !isRelatedPhotosPending && !isRelatedPhotosError && keyword && (
                        <QueryFeedback empty />
                    )}

                    {imageList && imageList.length > 0 && (
                        <InfiniteScroll
                            dataLength={imageList.length}
                            hasMore={!!relatedPhotos?.pages.at(-1)?.nextPage}
                            next={fetchNextPage}
                            loader={<div></div>}
                            scrollableTarget="mediaDetailScrollable"
                        >
                            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                                <Masonry sequential>
                                    {imageList.map((img) => {
                                        if (!img?.src?.large) return null;
                                        return <ImageItem image={img} key={img.id} />;
                                    })}

                                    {isFetchingNextPage &&
                                        Array.from({ length: 12 }).map((_, i) =>
                                            i % 2 === 0 ? <EvenSkeletonCard key={i} /> : <OddSkeletonCard key={i} />
                                        )
                                    }
                                </Masonry>
                            </ResponsiveMasonry>
                        </InfiniteScroll>
                    )}
                    {isRelatedPhotosError && (
                        <QueryFeedback error onRetry={() => void refetchRelatedPhotos()} />
                    )}
                </section>
            </div>
        </div>
    )
}

export default PhotoDetailModal;