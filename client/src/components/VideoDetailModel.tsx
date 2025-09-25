import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { LineSpinner } from 'ldrs/react';
import 'ldrs/react/LineSpinner.css';
import MediaSkeleton from "./layout/MediaSkeleton";
import { HiArrowLeft } from "react-icons/hi2";
import Suggestions from "@/pages/home/Suggestions";
import { IoSearch } from "react-icons/io5"; // Added import
import VideoItem from "./VideoItem"; // Updated from placeholder
import OddSkeletonCard from "./layout/OddSkeletonCard"; // Updated from placeholder
import EvenSkeletonCard from "./layout/EvenSkeletonCard"; // Updated from placeholder

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

const VideoDetailModal = () => {
    const navigate = useNavigate();
    const { videoId } = useParams();
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); // Added state for search

    // Added search handler
    const onSearchMedia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search/videos?query=${searchQuery}`);
        }
    };

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

    const getRelatedKeyword = async (video: any) => {
        // Updated to use video.image, which is the correct poster URL from Pexels API
        if (!video?.image) {
            console.error("Video poster image URL is missing.");
            return "";
        }

        try {
            const base64Image = await urlToBase64(video.image);
            // Updated prompts for better clarity
            const systemPrompt = `You are an AI-powered creative search assistant. Analyze the provided image (which is a poster frame from a video) and return a single, concise keyword that best represents the video's core subject matter. This keyword will be used to search for visually similar videos. Return ONLY a valid JSON object with a single key "keyword" containing the extracted string.`;
            const userPromptText = "Generate a search keyword for the theme of this video based on its poster image.";
            const payload = {
                contents: [{
                    parts: [
                        { text: userPromptText },
                        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
                    ]
                }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
            };

            const geminiResponse = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );

            const keywordObj = JSON.parse(geminiResponse.data.candidates[0].content.parts[0].text);
            return { keyword: keywordObj.keyword };
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
            // Updated per_page to 8
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
    // Updated logic for finding the best quality video file
    const mainVideoFile = video?.video_files?.find((file: any) => file.quality === 'hd' || file.quality === 'uhd')?.link || video?.video_files?.[0]?.link;

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
                {/* --- START: Added Search Bar and Suggestions --- */}
                {/* <div className="sticky top-0 left-0 right-0 bg-white z-20 -mt-8 pt-8 mb-8 -mx-8 px-8 border-b border-black/10">
                    <form onSubmit={onSearchMedia} className="relative h-[50px] w-full p-[16px] rounded-2xl flex items-center border border-black/10">
                        <input
                            className="text-md w-full border-none outline-none"
                            type="text"
                            placeholder="Discover photos & videos"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="pl-2 text-xl text-black/50 cursor-pointer">
                            <IoSearch />
                        </button>
                    </form>
                    <Suggestions />
                </div> */}
                {/* --- END: Added Search Bar and Suggestions --- */}
                
                {isVideoPending ? (
                    <div className="h-[540px] flex items-center justify-center">
                        <LineSpinner size="40" stroke="3" speed="1" color="#b8bfad" />
                    </div>
                ) : null}

                {video && (
                    <video
                        src={mainVideoFile}
                        poster={video.image} // Use video.image for poster
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

