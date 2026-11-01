import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { LineSpinner } from 'ldrs/react';
import 'ldrs/react/LineSpinner.css';
import EvenSkeletonCard from "@/components/layout/EvenSkeletonCard";
import OddSkeletonCard from "@/components/layout/OddSkeletonCard";
import Suggestions from "../home/Suggestions";
import { IoSearch } from "react-icons/io5";
import VideoItem from "@/components/media/VideoItem";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Video, VideoFile } from "@/types/types";
import QueryFeedback from "@/components/features/QueryFeedback";
import { getVideo, searchVideos } from "@/api/pexels";

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

const VideoDetailPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { videoId } = useParams();

    const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(`/search?query=${searchQuery}&type=videos`);
    };

    const getRelatedKeyword = async (video: Video): Promise<{ keyword: string } | ""> => {
        if (!video?.image) {
            throw new Error("Video poster image URL is missing")
        }

        try {
            const base64Image = await urlToBase64(video.image);

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

    const keyword = typeof keywordData === 'object' && keywordData !== null ? keywordData.keyword : undefined;

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

    return (
        <div className="relative bg-[#fdfcfb] px-[18px] pb-[24px] pt-[140px]">
            <div className="fixed top-0 right-0 left-0 z-10 m-auto border-b border-black/10 bg-[#fdfcfb] px-4 pt-4 md:left-[80px] md:px-5 md:pt-5">
                <form
                    onSubmit={onSearchMedia}
                    className="relative h-[50px] w-full p-[16px] rounded-2xl flex items-center border border-black/10"
                >
                    <input
                        aria-label="Search photos and videos"
                        className="text-md w-full border-none outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                        type="text"
                        placeholder="Discover photos & videos"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" aria-label="Search" className="pl-2 text-xl text-black/50 cursor-pointer">
                        <IoSearch />
                    </button>
                </form>
                <Suggestions />
            </div>

            <div className="bg-white rounded-4xl h-full">
                {isVideoPending ? (
                    <div className="h-[540px] flex items-center justify-center">
                        <LineSpinner size="40" stroke="3" speed="1" color="#b8bfad" />
                    </div>
                ) : null}
                {isVideoError && <QueryFeedback error onRetry={() => void refetchVideo()} />}

                {video && (
                    <video
                        src={
                            video.video_files.find((vf: VideoFile) => vf.quality === 'hd' || vf.quality === 'uhd')?.link
                            || video.video_files[0].link
                        }
                        poster={video.image}
                        className="m-auto h-auto max-h-[60vh] max-w-full rounded-3xl object-contain sm:h-[540px] sm:max-h-[70vh] sm:max-w-[1046px]"
                        controls
                        autoPlay
                        muted
                        loop
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

                    {videoList && videoList.length > 0 && (
                        <InfiniteScroll
                            dataLength={videoList.length}
                            hasMore={!!relatedVideos?.pages.at(-1)?.nextPage}
                            next={fetchNextPage}
                            loader={<div></div>}
                        >
                            <ResponsiveMasonry columnsCountBreakPoints={{ 480: 2, 768: 3, 1024: 4, 1440: 5 }}>
                                <Masonry sequential>
                                    {relatedVideos && videoList.map((vid) => {
                                        if (!vid?.video_files?.[0]?.link) return null;
                                        return <VideoItem video={vid} key={vid.id} />;
                                    })}

                                    {isFetchingNextPage
                                        ? Array.from({ length: 6 }).map((_, i) => {
                                            if (i % 2 == 0) return <EvenSkeletonCard key={i} />;
                                            return <OddSkeletonCard key={i} />;
                                        })
                                        : null
                                    }
                                </Masonry>
                            </ResponsiveMasonry>
                        </InfiniteScroll>
                    )}
                    {isRelatedVideosError && (
                        <QueryFeedback error onRetry={() => void refetchRelatedVideos()} />
                    )}
                </section>
            </div>
        </div>
    );
};

export default VideoDetailPage;