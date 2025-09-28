import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
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
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const getVideo = async () => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/videos/videos/${videoId}`,
                {
                    headers: {
                        Authorization: import.meta.env.VITE_PEXELS_API_KEY
                    }
                }
            );
            return res.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const getRelatedKeyword = async (video) => {
        if (!video?.image) {
            console.error("Video poster image URL is missing.");
            return "";
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
            return "";
        }
    };

    const { data: video, isPending: isVideoPending } = useQuery({
        queryKey: ["video", videoId],
        queryFn: getVideo
    });

    const { data: keywordData } = useQuery({
        queryKey: ["relatedKeyword", videoId],
        queryFn: () => getRelatedKeyword(video),
        enabled: !!video,
        staleTime: Infinity,
    });

    const keyword = keywordData?.keyword;

    const getRelatedVideos = async ({ pageParam = 1 }) => {
        try {
            const res = await axios.get(
                `https://api.pexels.com/v1/videos/search?query=${keyword}&per_page=8&page=${pageParam}`,
                {
                    headers: { Authorization: import.meta.env.VITE_PEXELS_API_KEY },
                }
            );
            const videos = res.data.videos;
            if (videos.length === 0) setHasMore(false);
            return { data: videos, nextPage: pageParam + 1 };
        } catch (err) {
            console.error(err);
            return { data: [], nextPage: undefined };
        }
    };

    const {
        data: relatedVideos,
        fetchNextPage,
        isFetchingNextPage,
        isPending: isRelatedVideosPending,
        isLoading: isRelatedVideosLoading
    } = useInfiniteQuery({
        queryKey: ["relatedVideos", keyword],
        queryFn: getRelatedVideos,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: !!keyword,
    });

    const videoList = relatedVideos?.pages.flatMap(p => p.data);
    const mainVideoFile = video?.video_files?.find((file) => file.quality === 'hd' || file.quality === 'uhd')?.link || video?.video_files?.[0]?.link;

    return (
        <div className='fixed inset-0 overflow-y-auto z-50 bg-black/30 backdrop-blur-xs py-[24px] px-4 sm:px-[120px]'>
            <div
                className="absolute top-[32px] left-4 sm:left-[36px] text-white text-3xl cursor-pointer"
                onClick={() => navigate(-1)}
            >
                <HiArrowLeft />
            </div>

            <div
                id="mediaDetailScrollable"
                className="relative bg-white p-6 sm:p-[54px] rounded-4xl h-full overflow-y-auto"
            >
                
                {isVideoPending ? (
                    <div className="h-[540px] flex items-center justify-center">
                        <LineSpinner size="40" stroke="3" speed="1" color="#b8bfad" />
                    </div>
                ) : null}

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

                    {(isRelatedVideosPending || isRelatedVideosLoading || !keyword) &&
                        (
                            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 3 }}>
                                <Masonry>
                                    {Array.from({ length: 6 }).map((_, i) => {
                                        if (i % 2 == 0) return <EvenSkeletonCard key={i} />
                                        return <OddSkeletonCard key={i} />
                                    })}
                                </Masonry>
                            </ResponsiveMasonry>
                        )
                    }

                    {videoList &&
                        <InfiniteScroll
                            dataLength={videoList.length}
                            hasMore={hasMore}
                            next={fetchNextPage}
                            loader={<div></div>}
                            scrollableTarget="mediaDetailScrollable"
                        >
                            <ResponsiveMasonry columnsCountBreakPoints={{ 992: 3 }}>
                                <Masonry gutter="1rem">
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
                </section>
            </div>
        </div>
    );
};

export default VideoDetailModal;

