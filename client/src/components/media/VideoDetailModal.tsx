import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { LineSpinner } from 'ldrs/react';
import 'ldrs/react/LineSpinner.css';
import { HiArrowLeft } from "react-icons/hi2";
import VideoItem from "./VideoItem";
import OddSkeletonCard from "../layout/OddSkeletonCard";
import EvenSkeletonCard from "../layout/EvenSkeletonCard";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Video, VideoFile } from "@/types/types";
import QueryFeedback from "@/components/features/QueryFeedback";
import { getVideo, searchVideos } from "@/api/pexels";

const urlToBase64 = async (url: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result?.toString().split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting URL to Base64:", error);
        throw error;
    }
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const VideoDetailModal = () => {
    const navigate = useNavigate();
    const { videoId } = useParams();
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
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKeyDown)
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
        };
    }, [navigate]);

    const getRelatedKeyword = async (video: Video): Promise<{ keyword: string } | ""> => {
        if (!video?.image) {
            throw new Error("Video poster image URL is missing")
        }

        try {
            const base64Image = await urlToBase64(video.image) as string;

            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                },
                systemInstruction: `
        You are an AI-powered creative search assistant. 
        Analyze the provided image (which is a poster frame from a video) 
        and return a single, concise keyword that best represents the video's core subject matter. 
        Return ONLY a valid JSON object with a single key "keyword".
      `
            });

            const result = await model.generateContent([
                { text: "Generate a search keyword for the theme of this video based on its poster image." },
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Image
                    }
                }
            ]);

            const text = await result.response.text();
            const keywordObj = JSON.parse(text);
            return keywordObj;
        } catch (err) {
            console.error("Error getting related keyword from Gemini:", err);
            throw err;
        }
    };

    const {
        data: video,
        isPending: isVideoPending,
        isError: isVideoError,
        refetch: refetchVideo,
    } = useQuery({
        queryKey: ["video", videoId],
        queryFn: ({ signal }) => {
            if (!videoId) throw new Error("Video ID is required")
            return getVideo(videoId, signal)
        },
        enabled: !!videoId,
    });

    const {
        data: keywordData,
        isPending: isKeywordPending,
        isError: isKeywordError,
        refetch: refetchKeyword,
    } = useQuery({
        queryKey: ["relatedKeyword", videoId],
        queryFn: () => {
            if (!video) throw new Error("Video is required to generate a related keyword")
            return getRelatedKeyword(video)
        },
        enabled: !!video,
        staleTime: Infinity,
    });

    const keyword = typeof keywordData === "object" && keywordData !== null ? keywordData.keyword : undefined;

    const {
        data: relatedVideos,
        fetchNextPage,
        isFetchingNextPage,
        isPending: isRelatedVideosPending,
        isError: isRelatedVideosError,
        refetch: refetchRelatedVideos,
    } = useInfiniteQuery({
        queryKey: ["relatedVideos", keyword],
        queryFn: ({ pageParam, signal }) => searchVideos(keyword ?? "", pageParam, 8, signal),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: !!keyword,
    });

    const videoList = relatedVideos?.pages.flatMap(p => p.data);
    const mainVideoFile = video?.video_files?.find((file: VideoFile) => file.quality === 'hd' || file.quality === 'uhd')?.link || video?.video_files?.[0]?.link;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Video details"
            className='fixed inset-0 z-50 overflow-y-auto bg-black/30 px-3 py-3 backdrop-blur-xs sm:px-8 sm:py-6 lg:px-[120px]'
        >
            <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close video details"
                className="absolute top-5 left-5 z-10 rounded-full p-2 text-3xl text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-[32px] sm:left-[36px]"
                onClick={() => navigate(-1)}
            >
                <HiArrowLeft />
            </button>

            <div
                id="mediaDetailScrollable"
                className="relative min-h-full overflow-y-auto rounded-3xl bg-white p-4 sm:rounded-4xl sm:p-8 lg:p-[54px]"
            >

                {isVideoPending ? (
                    <div className="h-[540px] flex items-center justify-center">
                        <LineSpinner size="40" stroke="3" speed="1" color="#b8bfad" />
                    </div>
                ) : null}
                {isVideoError && <QueryFeedback error onRetry={() => void refetchVideo()} />}

                {video && (
                    <video
                        src={mainVideoFile}
                        poster={video.image}
                        className="m-auto rounded-3xl h-[540px] max-w-full sm:max-w-[1046px] object-cover bg-black"
                        controls
                        autoPlay
                        loop
                        muted
                    />
                )}

                <section className="mt-[54px]">
                    <h1 className="text-3xl mb-[24px]">Related Videos</h1>

                    {isRelatedVideosPending && !!keyword &&
                        (
                            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                                <Masonry sequential>
                                    {Array.from({ length: 6 }).map((_, i) => {
                                        if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                                        return <OddSkeletonCard key={i} />
                                    })}
                                </Masonry>
                            </ResponsiveMasonry>
                        )
                    }
                    {isKeywordError && (
                        <QueryFeedback error onRetry={() => void refetchKeyword()} />
                    )}
                    {!isKeywordPending && !isKeywordError && !keyword && <QueryFeedback empty />}
                    {videoList?.length === 0 && !isRelatedVideosPending && !isRelatedVideosError && keyword && (
                        <QueryFeedback empty />
                    )}

                    {videoList && videoList.length > 0 &&
                        <InfiniteScroll
                            dataLength={videoList.length}
                            hasMore={!!relatedVideos?.pages.at(-1)?.nextPage}
                            next={fetchNextPage}
                            loader={<div></div>}
                            scrollableTarget="mediaDetailScrollable"
                        >
                            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                                <Masonry gutter="1rem" sequential>
                                    {videoList.map((vid) => {
                                        if (!vid?.image) return null;
                                        return <VideoItem video={vid} key={vid.id} />;
                                    })}

                                    {isFetchingNextPage
                                        ? Array.from({ length: 8 }).map((_, i) => { // Updated to 8
                                            if (i % 2 == 0) return <EvenSkeletonCard key={i} />;
                                            return <OddSkeletonCard key={i} />;
                                        })
                                        : null
                                    }
                                </Masonry>
                            </ResponsiveMasonry>
                        </InfiniteScroll>
                    }
                    {isRelatedVideosError && (
                        <QueryFeedback error onRetry={() => void refetchRelatedVideos()} />
                    )}
                </section>
            </div>
        </div>
    );
};

export default VideoDetailModal;
