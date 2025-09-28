import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
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
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const getPhoto = async () => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/photos/${photoId}`,
                { headers: { Authorization: import.meta.env.VITE_PEXELS_API_KEY } }
            );
            return res.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

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

    const keyword = typeof keywordData === "object" && keywordData !== null ? keywordData.keyword : undefined;

    const getRelatedImages = async ({ pageParam = 1 }) => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/search?query=${keyword}&per_page=12&page=${pageParam}`,
                { headers: { Authorization: import.meta.env.VITE_PEXELS_API_KEY } }
            );
            const photos = res.data.photos;
            if (photos.length === 0) setHasMore(false);
            return { data: photos, nextPage: pageParam + 1 };
        } catch (err) {
            console.error(err);
            return { data: [], nextPage: undefined };
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
        <div className='fixed inset-0 overflow-y-auto z-50 bg-black/30 backdrop-blur-xs py-[24px] px-[120px]'>
            <div
                className="absolute top-[32px] left-[36px] text-white text-3xl cursor-pointer"
                onClick={() => navigate(-1)}
            >
                <HiArrowLeft />
            </div>

            <div
                id="mediaDetailScrollable"
                className="relative bg-white p-[54px] rounded-4xl h-full overflow-y-auto"
            >
                {isPhotoPending && (
                    <div className="h-full flex items-center justify-center">
                        <LineSpinner size="40" stroke="3" speed="1" color="#b8bfad" />
                    </div>
                )}

                {photo && (
                    <img
                        src={photo?.src?.large2x || photo?.src?.large || photo?.src?.original}
                        className="m-auto h-full rounded-3xl max-w-[1046px]"
                        style={{ backgroundColor: photo.avg_color }}
                    />
                )}

                <section className="mt-[54px]">
                    <h1 className="text-3xl mb-[24px]">Related Photos</h1>

                    {(isRelatedPhotosPending || isRelatedPhotosLoading || !keyword) && <MediaSkeleton />}

                    {imageList && (
                        <InfiniteScroll
                            dataLength={imageList.length}
                            hasMore={hasMore}
                            next={fetchNextPage}
                            loader={<div></div>}
                            scrollableTarget="mediaDetailScrollable"
                        >
                            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 5 }}>
                                <Masonry>
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
                </section>
            </div>
        </div>
    )
}

export default PhotoDetailModal;