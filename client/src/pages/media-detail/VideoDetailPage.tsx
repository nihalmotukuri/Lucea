import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import QueryFeedback from "@/components/features/QueryFeedback"
import MediaDetailModalSkeleton from "@/components/media/MediaDetailModalSkeleton"
import MediaDetailView from "@/components/media/MediaDetailView"
import { getVideo } from "@/api/pexels"
import MediaDetailPageHeader from "./MediaDetailPageHeader"

const VideoDetailPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { videoId } = useParams()
    const goBack = useCallback(() => {
        if (location.key === "default") navigate("/")
        else navigate(-1)
    }, [location.key, navigate])
    const {
        data: video,
        isPending,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["video", videoId],
        queryFn: ({ signal }) => {
            if (!videoId) throw new Error("Video ID is required")
            return getVideo(videoId, signal)
        },
        enabled: Boolean(videoId),
    })

    return (
        <div className="min-h-full bg-[#fdfcfb] pt-[140px] dark:bg-[#121110]">
            <MediaDetailPageHeader />
            {!video && isPending && <MediaDetailModalSkeleton isModal={false} mediaType="video" />}
            {!video && isError && <div className="mx-auto max-w-3xl px-5 py-10"><QueryFeedback error isRetrying={isFetching} onRetry={() => void refetch()} /></div>}
            {video && <MediaDetailView item={{ type: "video", media: video }} onBack={goBack} />}
        </div>
    )
}

export default VideoDetailPage
